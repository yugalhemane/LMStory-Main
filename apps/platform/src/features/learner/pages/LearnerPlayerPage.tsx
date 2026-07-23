import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnrollmentDetails, useMarkCompleted, useMarkViewed } from '../api/learner.queries';
import { CourseCurriculumSidebar } from '../components/CourseCurriculumSidebar';
import { LessonContentCanvas } from '../components/LessonContentCanvas';
import { Skeleton, Button } from 'ui';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export function LearnerPlayerPage() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { data: enrollment, isLoading, error } = useEnrollmentDetails(enrollmentId || '');
  const { mutate: markCompleted, isPending: isCompleting } = useMarkCompleted(enrollmentId || '');
  const { mutate: markViewed } = useMarkViewed(enrollmentId || '');

  const [activeItemId, setActiveItemId] = useState<string | undefined>();

  // Extract flat list of items for navigation
  const allItems = enrollment?.courses?.[0]?.campaignCourse?.course?.sections?.flatMap(s => s.items) || [];
  const currentProgress = enrollment?.courses?.[0]?.progress || [];

  useEffect(() => {
    // Set initial active item if none selected
    if (enrollment && !activeItemId && allItems.length > 0) {
      // Find first incomplete or last accessed
      const firstIncomplete = allItems.find(item => {
        const prog = currentProgress.find(p => p.courseItemId === item.id);
        return prog?.status !== 'COMPLETED';
      });
      setActiveItemId(firstIncomplete?.id || allItems[0].id);
    }
  }, [enrollment, activeItemId, allItems, currentProgress]);

  const activeItemProgress = currentProgress.find(p => p.courseItemId === activeItemId);

  // Trigger markViewed when activeItemId changes
  useEffect(() => {
    if (activeItemProgress && activeItemProgress.status !== 'COMPLETED') {
      markViewed(activeItemProgress.id);
    }
  }, [activeItemProgress?.id]); // Only re-run if the active progress ID changes

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background p-4 gap-4">
        <Skeleton className="w-[320px] h-full hidden md:block" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-[60%] w-full" />
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-destructive">Error loading course</h1>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  const courseData = enrollment.courses[0];
  const courseObj = courseData.campaignCourse.course;
  
  const sectionsForSidebar = courseObj.sections.map(section => ({
    id: section.id,
    title: section.title,
    items: section.items.map(item => {
      const prog = currentProgress.find(p => p.courseItemId === item.id);
      return {
        id: item.id,
        title: item.tenantLibrary.title,
        status: prog?.status || 'NOT_STARTED'
      };
    })
  }));

  const activeItemData = allItems.find(i => i.id === activeItemId);
  const activeItemIndex = allItems.findIndex(i => i.id === activeItemId);

  const handleNext = () => {
    if (activeItemIndex < allItems.length - 1) {
      setActiveItemId(allItems[activeItemIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (activeItemIndex > 0) {
      setActiveItemId(allItems[activeItemIndex - 1].id);
    }
  };

  const handleMarkComplete = () => {
    if (activeItemProgress) {
      markCompleted(activeItemProgress.id);
    }
  };

  const isCompleted = activeItemProgress?.status === 'COMPLETED';
  const hasNext = activeItemIndex < allItems.length - 1;
  const hasPrev = activeItemIndex > 0;

  // Enforce locked correction: respect backend completion contract
  const completionCriteria = (activeItemData as any)?.completionCriteria || 'VIEW';
  const isMandatory = (activeItemData as any)?.isMandatory !== false; // defaults to true
  
  // Can only mark complete if the item explicitly allows MANUAL completion OR if it's optional.
  const canMarkComplete = !isCompleted && (completionCriteria === 'MANUAL' || !isMandatory);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <CourseCurriculumSidebar 
        courseTitle={courseObj.title}
        progressPercentage={courseData.progressPercentage || 0}
        sections={sectionsForSidebar}
        activeItemId={activeItemId}
        onSelectItem={setActiveItemId}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-bright relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-surface border-b border-border shrink-0">
          <div className="flex items-center gap-4 min-w-0">
             {/* Mobile Sidebar Trigger (injected via Sidebar isMobile=true theoretically, but let's just use it here or pass it) */}
             <div className="md:hidden">
               <CourseCurriculumSidebar 
                  isMobile
                  courseTitle={courseObj.title}
                  progressPercentage={courseData.progressPercentage || 0}
                  sections={sectionsForSidebar}
                  activeItemId={activeItemId}
                  onSelectItem={setActiveItemId}
               />
             </div>
             <h3 className="text-lg font-semibold text-foreground truncate">
               {activeItemData?.tenantLibrary.title || 'Loading...'}
             </h3>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} title="Exit to Dashboard">
              <span className="sr-only">Exit</span>
              ✕
            </Button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto">
          {activeItemData && activeItemProgress && (
            <LessonContentCanvas
              progressId={activeItemProgress.id}
              title={activeItemData.tenantLibrary.title}
              contentType={activeItemData.tenantLibrary.contentType}
              isCompleted={isCompleted}
              onComplete={handleMarkComplete}
              isCompleting={isCompleting}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <footer className="h-20 bg-surface border-t border-border px-4 md:px-8 flex items-center justify-between shrink-0">
          <div>
            <Button 
              variant="outline" 
              disabled={!hasPrev} 
              onClick={handlePrev}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant={isCompleted ? "secondary" : "default"}
              onClick={handleMarkComplete}
              disabled={isCompleting || isCompleted || !activeItemData || !canMarkComplete}
              className={isCompleted ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30" : "bg-primary"}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : !canMarkComplete && !isCompleted ? (
                'Cannot Complete Manually'
              ) : (
                'Mark as Complete'
              )}
            </Button>
            
            <Button 
              disabled={!hasNext} 
              onClick={handleNext}
              className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}

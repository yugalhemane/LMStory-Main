import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse, useUpdateCourse, useAddCourseSection, useReorderCourseSections, useReorderCourseItems } from '../../../hooks/useCourses';

import { Button, Input, Textarea, Label, Tabs, Badge, EmptyState } from 'ui';
import { ArrowLeft, Plus, Save, BookOpen, Video, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { ContentPickerModal } from '../components/ContentPickerModal';

export const CourseBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourse(id as string);
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
  const { mutate: addSection } = useAddCourseSection();
  const { mutate: reorderSections, isPending: isReorderingSections } = useReorderCourseSections();
  const { mutate: reorderItems, isPending: isReorderingItems } = useReorderCourseItems();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);


  const [_, setActiveTab] = useState('curriculum');
  
  // Details state
  const [details, setDetails] = useState({
    title: '',
    description: '',
    status: 'DRAFT',
    estimatedDuration: '',
  });

  useEffect(() => {
    if (course) {
      setDetails({
        title: course.title || '',
        description: course.description || '',
        status: course.status || 'DRAFT',
        estimatedDuration: course.estimatedDuration ? String(course.estimatedDuration) : '',
      });
    }
  }, [course]);

  const handleSaveDetails = () => {
    updateCourse({
      id: id as string,
      data: {
        title: details.title,
        description: details.description,
        status: details.status as any,
        estimatedDuration: details.estimatedDuration ? parseInt(details.estimatedDuration, 10) : undefined,
      }
    });
  };

  const handleAddSection = () => {
    const title = prompt('Section Title:');
    if (title) {
      addSection({ courseId: id as string, data: { title } });
    }
  };

  const handleReorderSection = (currentIndex: number, direction: 'up' | 'down') => {
    if (!course || !(course as any).sections) return;
    setReorderError(null);
    const sections = [...(course as any).sections];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    const [movedItem] = sections.splice(currentIndex, 1);
    sections.splice(newIndex, 0, movedItem);
    
    reorderSections({
      courseId: id as string,
      orderedIds: sections.map(s => s.id)
    }, {
      onError: () => setReorderError('Failed to reorder sections')
    });
  };

  const handleReorderItem = (sectionId: string, currentIndex: number, direction: 'up' | 'down') => {
    if (!course || !(course as any).sections) return;
    setReorderError(null);
    const sections = (course as any).sections;
    const section = sections.find((s: any) => s.id === sectionId);
    if (!section || !section.items) return;

    const items = [...section.items];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;

    const [movedItem] = items.splice(currentIndex, 1);
    items.splice(newIndex, 0, movedItem);

    reorderItems({
      courseId: id as string,
      sectionId,
      orderedIds: items.map(item => item.id)
    }, {
      onError: () => setReorderError('Failed to reorder items')
    });
  };

  const openPicker = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setIsPickerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState title="Course Not Found" description="The requested course could not be found." />
      </div>
    );
  }

  const sections = (course as any).sections || [];

  return (
    <div className="h-screen flex flex-col bg-surface-bright overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center h-16 px-6 w-full bg-card border-b border-border z-40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full" onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/courses`); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground line-clamp-1">Course Builder: {course.title || 'Untitled'}</h1>
          </div>
          <div className="h-6 w-[1px] bg-border mx-2"></div>
          <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'} className="uppercase text-[10px]">
            {course.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:bg-muted font-medium">
            Preview
          </Button>
          <Button onClick={handleSaveDetails} disabled={isUpdating} variant="outline" className="flex items-center gap-2 font-medium">
            <Save className="w-4 h-4" /> {isUpdating ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium px-6 shadow-sm">
            Publish
          </Button>
        </div>
      </header>

      {/* Builder Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Assets Panel (Left) - Visual Stub */}
        <aside className="w-72 bg-card border-r border-border flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 border-b border-border">
            <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Learning Assets</h2>
            <p className="text-xs text-muted-foreground mt-1">Drag assets to the canvas</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Rich Text Stub */}
            <div className="group flex items-center gap-3 p-3 bg-muted border border-border rounded-xl cursor-not-allowed transition-all opacity-70">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-secondary border border-border">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">Rich Text</h3>
                <p className="text-[10px] text-muted-foreground">Coming Soon</p>
              </div>
            </div>
            {/* Video Stub */}
            <div className="group flex items-center gap-3 p-3 bg-muted border border-border rounded-xl cursor-not-allowed transition-all opacity-70">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-secondary border border-border">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">Video</h3>
                <p className="text-[10px] text-muted-foreground">Coming Soon</p>
              </div>
            </div>
            {/* SCORM Stub */}
            <div className="group flex items-center gap-3 p-3 bg-muted border border-border rounded-xl cursor-not-allowed transition-all opacity-70">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-secondary border border-border">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">SCORM</h3>
                <p className="text-[10px] text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Central Canvas */}
        <main className="flex-1 overflow-y-auto bg-surface-bright relative">
          <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8 pb-32">
            <Tabs
              defaultTabId="curriculum"
              onChange={setActiveTab}
              tabs={[
                {
                  id: 'curriculum',
                  label: 'Curriculum',
                  content: (
                    <div className="space-y-6 mt-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Course Structure</h2>
                        <Button onClick={handleAddSection} size="sm" variant="outline" className="flex items-center gap-2 bg-background">
                          <Plus className="w-4 h-4" /> Add Section
                        </Button>
                      </div>

                      {reorderError && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200">
                          {reorderError}
                        </div>
                      )}

                      {sections.length === 0 ? (
                        <div className="mt-8">
                          <EmptyState
                            title="No sections yet"
                            description="Start building your course by adding your first section."
                            icon={<BookOpen className="w-12 h-12" />}
                            action={
                              <Button onClick={handleAddSection} className="mt-2 bg-secondary text-secondary-foreground">
                                Add Section
                              </Button>
                            }
                          />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {sections.map((section: any, index: number) => (
                            <div key={section.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                              <div className="bg-muted p-4 border-b border-border flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col gap-0.5">
                                    <button 
                                      onClick={() => handleReorderSection(index, 'up')}
                                      disabled={index === 0 || isReorderingSections}
                                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                    >
                                      <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleReorderSection(index, 'down')}
                                      disabled={index === sections.length - 1 || isReorderingSections}
                                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <h3 className="font-semibold text-foreground text-base">{section.title}</h3>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => openPicker(section.id)} className="bg-background">
                                  <Plus className="w-4 h-4 mr-1" /> Add Item
                                </Button>
                              </div>
                              <div className="p-2 bg-background min-h-[100px] flex flex-col justify-center">
                                {(!section.items || section.items.length === 0) ? (
                                  <div className="p-4 text-center border-2 border-dashed border-border rounded-lg m-2">
                                    <p className="text-sm font-medium text-muted-foreground">Empty Section</p>
                                    <p className="text-xs text-muted-foreground mt-1">Click 'Add Item' to insert content.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-1 p-2">
                                    {section.items.map((item: any, itemIndex: number) => (
                                      <div key={item.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg border border-transparent hover:border-border transition-colors group">
                                        <div className="flex items-center gap-3">
                                          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                              onClick={() => handleReorderItem(section.id, itemIndex, 'up')}
                                              disabled={itemIndex === 0 || isReorderingItems}
                                              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                            >
                                              <ChevronUp className="w-3 h-3" />
                                            </button>
                                            <button 
                                              onClick={() => handleReorderItem(section.id, itemIndex, 'down')}
                                              disabled={itemIndex === section.items.length - 1 || isReorderingItems}
                                              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                            >
                                              <ChevronDown className="w-3 h-3" />
                                            </button>
                                          </div>
                                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border border-border">
                                            {item.itemType === 'VIDEO' ? <Video className="w-4 h-4 text-secondary" /> : <FileText className="w-4 h-4 text-primary" />}
                                          </div>
                                          <span className="text-sm font-medium text-foreground">{item.title || 'Untitled Item'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                          {item.isMandatory && <Badge variant="outline" className="text-[10px]">Required</Badge>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  id: 'details',
                  label: 'Settings',
                  content: (
                    <div className="mt-6 max-w-2xl space-y-6">
                      <div className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="text-base font-semibold text-foreground border-b border-border pb-3 mb-4">Basic Information</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="title">Course Title</Label>
                          <Input
                            id="title"
                            value={details.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetails({ ...details, title: e.target.value })}
                            placeholder="e.g. Introduction to Acme Corp"
                            className="bg-background"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={details.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails({ ...details, description: e.target.value })}
                            placeholder="Describe what learners will get out of this course..."
                            rows={4}
                            className="bg-background"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              value={details.status}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDetails({ ...details, status: e.target.value })}
                              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="PUBLISHED">Published</option>
                              <option value="ARCHIVED">Archived</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Estimated Duration (mins)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={details.estimatedDuration}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetails({ ...details, estimatedDuration: e.target.value })}
                              placeholder="e.g. 60"
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </main>
      </div>
      <ContentPickerModal
        courseId={id as string}
        sectionId={activeSectionId}
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useCourses } from '../../../hooks/useCourses';
import { Button, EmptyState, Input } from 'ui';
import { Plus, Search, BookOpen, MoreVertical, FileArchive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CourseListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false); // Placeholder for create modal
  const { data: coursesData, isLoading } = useCourses({ search });
  const navigate = useNavigate();

  const handleCreate = () => {
    // In a real implementation this would open a modal,
    // and on submit we would call create mutation then navigate to builder.
    setCreateModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-emerald-100 text-emerald-800';
      case 'DRAFT': return 'bg-amber-100 text-amber-800';
      case 'ARCHIVED': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6 bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your tenant's course library.</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Plus className="w-4 h-4" />
          Create Course
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !(coursesData?.data || []).length ? (
        <EmptyState
          title="No courses found"
          description="You don't have any courses yet. Create one to get started."
          icon={<BookOpen className="w-12 h-12" />}
          action={
            <Button onClick={handleCreate} className="mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Create Course
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(coursesData?.data || []).map((course: any) => (
            <div 
              key={course.id} 
              className="group bg-card border border-border rounded-xl overflow-hidden hover:border-secondary hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="relative aspect-video bg-muted overflow-hidden flex items-center justify-center border-b border-border">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <FileArchive className="w-16 h-16 text-muted-foreground/30" />
                )}
                
                {/* Level / Tag Overlay */}
                <div className="absolute top-3 left-3 bg-primary-container/80 backdrop-blur-md px-2 py-1 rounded text-primary-foreground text-[10px] font-bold tracking-wider uppercase">
                  {course.category || 'COURSE'}
                </div>
                
                {/* Duration Overlay */}
                {course.estimatedDuration && (
                  <div className="absolute bottom-3 right-3 bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                    {course.estimatedDuration}m
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description || 'No description provided for this course.'}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusColor(course.status)}`}>
                      {course.status}
                    </div>
                  </div>
                  <button className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Course Modal would go here */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-card p-6 rounded-xl max-w-md w-full border border-border shadow-xl">
             <h2 className="text-xl font-bold mb-4 text-foreground">Create Course</h2>
             <p className="text-sm text-muted-foreground mb-6">Course creation options are coming soon.</p>
             <div className="flex justify-end gap-3">
               <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
               <Button className="bg-secondary text-secondary-foreground" onClick={() => setCreateModalOpen(false)}>Create</Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

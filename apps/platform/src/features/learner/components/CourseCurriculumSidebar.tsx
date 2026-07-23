import { Sheet, SheetContent, SheetTrigger } from 'ui';
import { Button, Progress } from 'ui';
import { Menu, PlayCircle, CheckCircle, Lock, BookOpen } from 'lucide-react';

interface CourseCurriculumSidebarProps {
  courseTitle: string;
  progressPercentage: number;
  sections: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      title: string;
      status: string;
    }>;
  }>;
  activeItemId?: string;
  onSelectItem: (itemId: string) => void;
  isMobile?: boolean;
}

export function CourseCurriculumSidebar({
  courseTitle,
  progressPercentage,
  sections,
  activeItemId,
  onSelectItem,
  isMobile = false,
}: CourseCurriculumSidebarProps) {
  const content = (
    <div className="flex flex-col h-full bg-primary-container text-primary-foreground border-r border-border">
      {/* Sidebar Header */}
      <div className="p-6 space-y-4 border-b border-primary-foreground/10 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="text-secondary" />
          <h1 className="font-semibold text-white">LMStory</h1>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-wider opacity-80 mb-1">Course Title</h2>
          <p className="text-lg font-semibold text-white leading-tight line-clamp-2">{courseTitle}</p>
        </div>
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs opacity-90">
            <span>Your Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-white/10" />
        </div>
      </div>

      {/* Curriculum List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {sections.map((section, idx) => (
          <div key={section.id} className="space-y-1">
            <div className="flex items-center justify-between p-2 text-white font-bold text-sm">
              <span className="uppercase tracking-widest text-xs">
                Section {idx + 1}: {section.title}
              </span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.id === activeItemId;
                const isCompleted = item.status === 'COMPLETED';
                const isLocked = item.status === 'LOCKED'; // Assuming a LOCKED status

                return (
                  <button
                    key={item.id}
                    disabled={isLocked}
                    onClick={() => onSelectItem(item.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : isLocked
                        ? 'text-primary-foreground/40 cursor-not-allowed'
                        : 'text-primary-foreground/90 hover:bg-white/10'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5 shrink-0" />
                    ) : isCompleted ? (
                      <CheckCircle className={`w-5 h-5 shrink-0 ${isActive ? '' : 'text-emerald-400'}`} />
                    ) : (
                      <PlayCircle className="w-5 h-5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] p-0 border-none">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-[320px] h-full shrink-0">
      {content}
    </aside>
  );
}

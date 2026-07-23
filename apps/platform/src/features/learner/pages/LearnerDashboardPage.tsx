import { useLearnerDashboard } from '../api/learner.queries';
import { Card, Button, Progress, Skeleton } from 'ui';
import { 
  PlayCircle, 
  CheckCircle, 
  Flame, 
  Star, 
  Clock, 
  Award,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';

export function LearnerDashboardPage() {
  const { data, isLoading, error } = useLearnerDashboard();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-[1440px] mx-auto">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-destructive">Error loading dashboard</h1>
        <p className="text-muted-foreground mt-2">Could not retrieve your learning data.</p>
      </div>
    );
  }

  const { active, completed, continueLearning, summary } = data;

  const handleResume = (enrollmentId: string) => {
    navigate(`/player/${enrollmentId}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto bg-background min-h-[calc(100vh-4rem)]">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-xl p-8 bg-primary-container text-primary-foreground min-h-[220px] flex flex-col justify-center">
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.email?.split('@')[0] || 'Learner'}</h1>
          <p className="text-lg text-primary-foreground/80 max-w-lg">
            You have {summary['IN_PROGRESS'] || 0} courses in progress. Just a little more to reach your next milestone!
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {continueLearning ? (
              <Button 
                onClick={() => handleResume(continueLearning.enrollmentId)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6"
              >
                Resume Last Course
                <PlayCircle className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button disabled className="bg-secondary text-secondary-foreground px-6">
                No active courses
              </Button>
            )}
            <Button variant="outline" className="border-border text-foreground hover:bg-surface-variant/10">
              View Roadmap
            </Button>
          </div>
        </div>
        
        {/* Placeholder for 3D Illustration */}
        <div className="absolute right-8 bottom-0 hidden lg:block h-[180px] w-[300px] bg-muted/20 rounded-tl-full opacity-50">
        </div>
      </section>

      {/* Stats Bar (Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-bold">-- Days</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
        </div>
        
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Experience Points</p>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-bold">-- Hours</p>
            <p className="text-xs text-muted-foreground">Learning Time</p>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Certificates</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Assigned Campaigns Bento */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Assigned Campaigns</h2>
            <Button variant="link" className="text-secondary text-sm">Explore All</Button>
          </div>
          
          {active.length === 0 ? (
            <div className="p-8 border border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-card">
              <p className="text-muted-foreground">You don't have any assigned courses right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {active.map((enrollment) => {
                const course = enrollment.courses?.[0];
                if (!course) return null;
                
                return (
                  <Card 
                    key={enrollment.id} 
                    className="p-4 rounded-xl space-y-4 group hover:border-secondary transition-all cursor-pointer bg-card shadow-sm"
                    onClick={() => handleResume(enrollment.id)}
                  >
                    <div className="h-40 rounded-lg overflow-hidden relative bg-muted">
                      {course.campaignCourse.course.thumbnail ? (
                        <img 
                          src={course.campaignCourse.course.thumbnail} 
                          alt={course.campaignCourse.course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/5">
                          No Thumbnail
                        </div>
                      )}
                      <span className="absolute top-3 right-3 bg-primary-container/80 text-primary-foreground text-xs px-2 py-1 rounded backdrop-blur">
                        {enrollment.campaign?.name || 'Campaign'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                        {course.campaignCourse.course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {course.campaignCourse.course.description || 'Continue your learning journey.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-secondary font-bold">{Math.round(course.progressPercentage || 0)}%</span>
                      </div>
                      <Progress value={course.progressPercentage || 0} className="h-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Activity & Certificates */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Recent Activity */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Recent activity</h2>
            <div className="space-y-4">
              {/* Timeline Items (Placeholder UI) */}
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-1.5 ring-4 ring-secondary/20"></div>
                  <div className="absolute top-4 left-[3px] w-[2px] h-10 bg-border"></div>
                </div>
                <div>
                  <p className="text-sm text-foreground"><span className="font-bold">Activity</span> feed is coming soon</p>
                  <p className="text-xs text-muted-foreground">Pending integration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Certificates / Courses */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Completed courses</h2>
              <CheckCircle className="text-secondary h-5 w-5" />
            </div>
            
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No completed courses yet.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {completed.slice(0, 3).map((enrollment) => {
                    const course = enrollment.courses?.[0];
                    if (!course) return null;
                    return (
                      <li key={enrollment.id} className="p-3 bg-muted/30 rounded-lg border border-border/50 flex items-center justify-between group hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-foreground line-clamp-1">{course.campaignCourse.course.title}</span>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary">
                          <Download className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {completed.length > 3 && (
                  <Button variant="outline" className="w-full mt-4 border-dashed text-muted-foreground">
                    View All {completed.length} Courses
                  </Button>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* Recommended Content (Placeholder) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Recommended for you</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar opacity-60 pointer-events-none">
          {/* Skeleton Cards for Recommended */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] bg-card border border-border rounded-xl p-3 space-y-3 shadow-sm">
              <div className="w-full h-32 bg-muted rounded-lg"></div>
              <div className="p-1 space-y-2">
                <div className="h-3 w-16 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-2/3 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

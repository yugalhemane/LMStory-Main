import { useCoursesReport } from '../hooks/useReportQueries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button
} from 'ui';
import { Download, Search, Filter, BookOpen, Star, TrendingUp, BarChart2 } from 'lucide-react';
import { Input } from 'ui';
import { useState } from 'react';

export function CourseReportsPage() {
  const { data, isLoading, error } = useCoursesReport();
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Course Reports</h1>
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight text-destructive mb-4">Error loading reports</h1>
        <p className="text-muted-foreground">Could not retrieve course report metrics. Please try again later.</p>
      </div>
    );
  }

  const courses = data.data.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-6 bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Course Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Analyze learner engagement and completion metrics across your library.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2 cursor-not-allowed opacity-70" title="Coming Soon">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <BookOpen className="w-5 h-5 text-secondary" />
            <h3 className="font-medium">Total Courses</h3>
          </div>
          <p className="text-3xl font-bold">{data.data.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-medium">Avg Completion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-foreground opacity-40">—</p>
          <span className="text-xs text-muted-foreground mt-1 block">Coming Soon</span>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium">Platform Engagement</h3>
          </div>
          <p className="text-3xl font-bold text-foreground opacity-40">—</p>
          <span className="text-xs text-muted-foreground mt-1 block">Coming Soon</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search courses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background w-full" 
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 cursor-not-allowed opacity-70" title="Coming soon">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Course Details</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-right">Enrollments</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-right">Completions</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Completion Rate</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Rating</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No course reports found.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shrink-0">
                          <span className="material-symbols-outlined">school</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Status: {course.status}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{course.enrollmentCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{course.completionCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 w-40">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full transition-all" style={{ width: `${course.completionRate}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold w-12">{course.completionRate.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{course.averageScore > 0 ? course.averageScore.toFixed(1) : '--'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-secondary cursor-not-allowed opacity-70" title="Coming Soon">
                        <span className="material-symbols-outlined text-[18px]">insights</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

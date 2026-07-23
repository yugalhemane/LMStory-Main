import { useState } from 'react';
import { useUsersReport } from '../hooks/useReportQueries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input
} from 'ui';
import { ChevronLeft, ChevronRight, Download, Search, Filter, Users, TrendingUp, Award } from 'lucide-react';

export function UserReportsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, error } = useUsersReport({ page, limit });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-4">User Reports</h1>
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
        <p className="text-muted-foreground">Could not retrieve user report metrics. Please try again later.</p>
      </div>
    );
  }

  const users = data.data.data;
  const total = data.data.total;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-6 bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor learner progress, engagement, and completion metrics.</p>
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
            <Users className="w-5 h-5 text-secondary" />
            <h3 className="font-medium">Total Users</h3>
          </div>
          <p className="text-3xl font-bold">{total}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-medium">Active Learners</h3>
          </div>
          <p className="text-3xl font-bold text-foreground opacity-40">—</p>
          <span className="text-xs text-muted-foreground mt-1 block">Coming Soon</span>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-medium">Total Certificates</h3>
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
              placeholder="Search users... (Coming Soon)" 
              disabled
              className="pl-9 bg-background w-full opacity-70" 
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
                <TableHead className="font-semibold uppercase text-xs tracking-wider">User</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Email</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Department</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-center">Enrolled</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Avg Progress</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-center">Certificates</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No user reports found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const name = user.firstName || user.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                    : 'N/A';
                  const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');

                  return (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                            {initials || 'U'}
                          </div>
                          <span className="font-medium text-foreground">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.department || '—'}</TableCell>
                      <TableCell className="text-center font-medium">{user._count.enrollments}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 w-32">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="bg-secondary h-full rounded-full transition-all" style={{ width: '0%' }}></div>
                          </div>
                          <span className="text-xs font-semibold w-8 text-muted-foreground">--%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-sm">
                        <span className="px-2 py-1 bg-muted rounded-md">{user._count.certificates}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-secondary transition-all cursor-not-allowed" title="Coming Soon">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 p-4 border-t border-border bg-muted/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="text-xs font-medium text-muted-foreground px-2">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

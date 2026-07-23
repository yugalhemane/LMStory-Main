
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from 'ui';
import { useCampaign } from '../api/campaign.queries';
import { useEnrollments } from '../../enrollments/api/enrollment.queries';
import { CampaignStatus, EnrollmentStatus } from 'api';
import { Mail, Download, X, Users, CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

const statusStyles: Record<CampaignStatus, { bg: string, text: string, dot: string }> = {
  DRAFT: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  SCHEDULED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  ACTIVE: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  PAUSED: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  COMPLETED: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  ARCHIVED: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' }
};

const enrollmentStatusColors: Record<EnrollmentStatus, string> = {
  NOT_STARTED: 'bg-surface-variant text-on-surface-variant',
  IN_PROGRESS: 'bg-secondary-container text-on-secondary-container',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-error-container text-on-error-container',
  CANCELLED: 'bg-outline text-surface-container-lowest'
};

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaign, isLoading: campaignLoading } = useCampaign(id!);
  
  // Use pagination meta to safely get counts
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments({ campaignId: id, limit: 50 });
  const { data: completedEnrollmentsData } = useEnrollments({ campaignId: id, status: 'COMPLETED', limit: 1 });

  if (campaignLoading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!campaign) return <div className="p-12 text-center text-destructive font-medium">Campaign not found</div>;

  const totalEnrolled = enrollmentsData?.meta?.total || 0;
  const totalCompleted = completedEnrollmentsData?.meta?.total || 0;
  const completionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-6 bg-background min-h-[calc(100vh-4rem)]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')} className="bg-muted/50 hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{campaign.name}</h1>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[campaign.status].bg} ${statusStyles[campaign.status].text}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusStyles[campaign.status].dot}`}></div>
                {campaign.status}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created on {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'Unknown'} • 
              Ends {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'TBD'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'DRAFT' && (
            <Button onClick={() => navigate(`/campaigns/new?id=${campaign.id}`)} variant="outline">Edit Campaign</Button>
          )}
          <Button variant="outline" className="flex items-center gap-2 cursor-not-allowed opacity-70" title="Coming Soon">
            <Mail className="w-4 h-4" /> Send Reminder
          </Button>
          <Button variant="outline" className="flex items-center gap-2 cursor-not-allowed opacity-70" title="Coming Soon">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button variant="destructive" className="flex items-center gap-2 cursor-not-allowed opacity-70" title="Coming Soon">
            <X className="w-4 h-4" /> Close Campaign
          </Button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground font-medium text-sm">Learners Enrolled</span>
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-foreground">{totalEnrolled}</h3>
          </div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground font-medium text-sm">Completed</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-foreground">{totalCompleted}</h3>
            <div className="w-full bg-muted mt-3 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
            </div>
            <span className="text-muted-foreground text-xs font-medium mt-1.5 block">{completionRate}% completion rate</span>
          </div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground font-medium text-sm">Overdue</span>
            <AlertTriangle className="w-5 h-5 text-destructive opacity-40" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-foreground opacity-40">—</h3>
            <span className="text-muted-foreground text-xs mt-1.5 block">Coming Soon</span>
          </div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground font-medium text-sm">Avg. Completion Time</span>
            <Clock className="w-5 h-5 text-blue-500 opacity-40" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-foreground opacity-40">—</h3>
            <span className="text-muted-foreground text-xs mt-1.5 block">Coming Soon</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Enrolled Learners</h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">User</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Email</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Status</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Progress</TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider">Enrolled At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollmentsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading learners...</TableCell>
                </TableRow>
              ) : enrollmentsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No learners enrolled.
                  </TableCell>
                </TableRow>
              ) : (
                enrollmentsData?.data?.map(enrollment => (
                  <TableRow key={enrollment.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium p-4 text-foreground">
                      {enrollment.user?.firstName} {enrollment.user?.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{enrollment.user?.email}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${enrollmentStatusColors[enrollment.status]}`}>
                        {enrollment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full" style={{ width: `${enrollment.progressPercentage}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{enrollment.progressPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
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

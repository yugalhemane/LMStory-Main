import { useDashboardSummary } from '../../reports';
import { useCampaigns } from '../../campaigns/api/campaign.queries';
import { Button } from 'ui';
import { 
  Users, 
  Megaphone,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Rocket,
  Activity,
  Server,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';

export function TenantAdminDashboardPage() {
  const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useDashboardSummary();
  const { data: campaignsData, isLoading: isCampaignsLoading } = useCampaigns({ limit: 5 });
  const { user } = useAuthStore();

  const isLoading = isSummaryLoading || isCampaignsLoading;

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Tenant Dashboard</h1>
        <div className="animate-pulse flex gap-4">
          <div className="h-32 w-full bg-muted/50 rounded-lg"></div>
          <div className="h-32 w-full bg-muted/50 rounded-lg"></div>
          <div className="h-32 w-full bg-muted/50 rounded-lg"></div>
          <div className="h-32 w-full bg-muted/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (summaryError || !summaryData) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-destructive">Error loading dashboard</h1>
        <p className="text-muted-foreground mt-2">Could not retrieve dashboard metrics. Please try again later.</p>
      </div>
    );
  }

  const summary = summaryData.data;
  const campaigns = campaignsData?.data || [];
  
  const completionRate = summary.totalEnrollments > 0 
    ? Math.round((summary.completedEnrollments / summary.totalEnrollments) * 100) 
    : 0;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto bg-background min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Tenant Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here is the operational overview for <span className="font-bold">{user?.tenantId || 'your organization'}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm font-medium" asChild>
            <Link to="/users">
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Link>
          </Button>
          <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/campaigns/new">
              <Rocket className="mr-2 h-4 w-4" /> Start Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Learners (Partial API) */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-full">
              <Users className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Learners</p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{summary.totalUsers}</h3>
          </div>
        </div>

        {/* Active Campaigns (Real API) */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-full">
              <Megaphone className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Campaigns</p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{summary.activeCampaigns}</h3>
          </div>
        </div>

        {/* Completion Rate (Partial API) */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-full">
              <CheckCircle className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Calculated
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion Rate</p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{completionRate}%</h3>
          </div>
        </div>

        {/* Overdue Learners (Placeholder) */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Coming Soon
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overdue Learners</p>
            <h3 className="text-3xl font-bold text-muted-foreground/50 mt-1">--</h3>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Chart + Table) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Area (Placeholder) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-semibold text-foreground">Campaign Completion Trends</h4>
                <p className="text-sm text-muted-foreground mt-1">Completion rate vs. active learners (Coming Soon)</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-secondary mr-1.5"></span> Completions
                </span>
              </div>
            </div>
            
            {/* Empty State for Chart */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] border border-dashed border-border rounded-lg bg-muted/20">
              <Activity className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground/60">Trend analytics not yet integrated</p>
            </div>
          </div>

          {/* Table: Active Campaign Status (Partial API) */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h4 className="text-lg font-semibold text-foreground">Active Campaign Status</h4>
              <Link to="/campaigns" className="text-sm font-medium text-secondary hover:underline">
                View All
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        No active campaigns found.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign: any) => (
                      <tr key={campaign.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-foreground">{campaign.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                              {/* Assuming placeholder progress if actual not available */}
                              <div className="h-full bg-secondary w-0 rounded-full"></div>
                            </div>
                            <span className="text-xs text-muted-foreground">0%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            campaign.status === 'PUBLISHED' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-muted text-muted-foreground border-border'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link to={`/campaigns/${campaign.id}`}>
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebars) */}
        <div className="space-y-6">
          {/* System Health / Resource Usage (Placeholder) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
            <h4 className="text-lg font-semibold text-foreground mb-4">Resource Usage</h4>
            
            {/* Empty State for Health */}
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
              <Server className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground/60">Resource metrics unavailable</p>
            </div>
          </div>

          {/* Recent Activity (Placeholder) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
            <h4 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h4>
            
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
              <Activity className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground/60">Activity feed coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

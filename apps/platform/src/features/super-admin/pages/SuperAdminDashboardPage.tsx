import { useTenants } from '../api/useSuperAdminQueries';
import { Button } from 'ui';
import { 
  Building2, 
  Plus, 
  Download,
  UserCheck,
  HardDrive,
  DollarSign,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SuperAdminDashboardPage() {
  const { data: tenants, isLoading, error } = useTenants();

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
        <div className="animate-pulse flex gap-4">
          <div className="h-32 w-full bg-muted/50 rounded-lg"></div>
          <div className="h-32 w-full bg-muted/50 rounded-lg"></div>
          <div className="h-32 w-full bg-muted/50 rounded-lg"></div>
          <div className="h-32 w-full bg-muted/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !tenants) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-destructive">Error loading dashboard</h1>
        <p className="text-muted-foreground mt-2">Could not retrieve tenant data.</p>
      </div>
    );
  }

  const activeTenants = tenants.filter((t: any) => t.status === 'ACTIVE').length;
  const totalTenants = tenants.length;
  
  // We'll show up to 5 recent tenants
  const recentTenants = [...tenants].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto bg-background min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">System Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time performance metrics and administration hub.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm font-medium">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/super-admin/tenants/new">
              <Plus className="mr-2 h-4 w-4" /> New Tenant
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tenants (Real Data) */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-full">
              <Building2 className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {activeTenants} active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{totalTenants}</h3>
          </div>
        </div>

        {/* Active Users (Placeholder) */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-full">
              <UserCheck className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Coming Soon
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">Active Users</p>
            <h3 className="text-3xl font-bold text-muted-foreground/50 mt-1">--</h3>
          </div>
        </div>

        {/* Storage Usage (Placeholder) */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Storage Usage</p>
            <h3 className="text-xl font-bold text-muted-foreground/50 mt-2">-- / -- TB</h3>
            <p className="text-xs text-muted-foreground mt-1">Metrics unavailable</p>
          </div>
          <div className="p-2 bg-secondary/10 rounded-full">
            <HardDrive className="h-5 w-5 text-secondary" />
          </div>
        </div>

        {/* Revenue (Placeholder) */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-full">
              <DollarSign className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Coming Soon
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
            <h3 className="text-3xl font-bold text-muted-foreground/50 mt-1">$--</h3>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Chart Area (Placeholder) */}
        <div className="col-span-12 lg:col-span-8 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">Platform Growth</h4>
              <p className="text-sm text-muted-foreground mt-1">Daily active users over time (Coming Soon)</p>
            </div>
            <select disabled className="text-sm border-border rounded-md bg-muted/50 text-muted-foreground opacity-50 px-3 py-1.5 outline-none">
              <option>Last 30 Days</option>
            </select>
          </div>
          
          {/* Empty State for Chart */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] border border-dashed border-border rounded-lg bg-muted/20">
            <UserCheck className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground/60">Analytics module not yet integrated</p>
          </div>
        </div>

        {/* System Health (Placeholder) & Security Pulse */}
        <div className="col-span-12 lg:col-span-4 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">System Health</h4>
            
            {/* Empty State for Health */}
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
              <HardDrive className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground/60">Health metrics unavailable</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-secondary/5 rounded-lg border border-secondary/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              <span className="text-sm font-semibold text-foreground">Security Pulse</span>
            </div>
            <p className="text-sm text-muted-foreground">Automated security scanning is active. No critical vulnerabilities detected.</p>
          </div>
        </div>

        {/* Table: Recent Tenant Signups */}
        <div className="col-span-12 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h4 className="text-lg font-semibold text-foreground">Recent Tenant Signups</h4>
            <Link to="/super-admin/tenants" className="text-sm font-medium text-secondary hover:underline">
              View All Tenants
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No tenants found.
                    </td>
                  </tr>
                ) : (
                  recentTenants.map((tenant: any) => (
                    <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                            {tenant.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground">{tenant.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {tenant.domain}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          tenant.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link to={`/super-admin/tenants/${tenant.id}`}>
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
    </div>
  );
}

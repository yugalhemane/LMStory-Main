import { useParams, useNavigate } from 'react-router-dom';
import { useTenant, useDeleteTenant, useRestoreTenant } from '../api/useSuperAdminQueries';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from 'ui';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export function TenantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tenant, isLoading, error } = useTenant(id || '');
  const { mutate: deleteTenant, isPending: isDeleting } = useDeleteTenant();
  const { mutate: restoreTenant, isPending: isRestoring } = useRestoreTenant();

  if (isLoading) {
    return <div className="p-8"><div className="h-64 animate-pulse bg-muted/50 rounded-md" /></div>;
  }

  if (error || !tenant) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error loading tenant</h1>
        <Button onClick={() => navigate('/super-admin/tenants')}>Back to list</Button>
      </div>
    );
  }

  const handleDeactivate = () => {
    if (confirm('Are you sure you want to deactivate/archive this tenant?')) {
      deleteTenant(tenant.id, {
        onSuccess: () => toast.success('Tenant deactivated successfully'),
        onError: () => toast.error('Failed to deactivate tenant')
      });
    }
  };

  const handleRestore = () => {
    restoreTenant(tenant.id, {
      onSuccess: () => toast.success('Tenant restored successfully'),
      onError: () => toast.error('Failed to restore tenant')
    });
  };

  const isActive = tenant.status === 'ACTIVE';

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/super-admin/tenants')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tenants
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{tenant.name}</h2>
          <p className="text-muted-foreground mt-1">Tenant Code: {tenant.code}</p>
        </div>
        <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-emerald-500' : ''}>
          {tenant.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium text-sm text-muted-foreground">Slug: </span>
              <span>{tenant.slug}</span>
            </div>
            <div>
              <span className="font-medium text-sm text-muted-foreground">Domain: </span>
              <span>{tenant.domain || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-sm text-muted-foreground">Created At: </span>
              <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {isActive 
              ? "Deactivating a tenant will block access for all its users and admins. This is a soft-delete operation."
              : "Restoring a tenant will reinstate access for its users."}
          </p>
          {isActive ? (
            <Button variant="destructive" onClick={handleDeactivate} disabled={isDeleting}>
              {isDeleting ? 'Deactivating...' : 'Deactivate / Archive Tenant'}
            </Button>
          ) : (
            <Button variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? 'Restoring...' : 'Restore Tenant'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

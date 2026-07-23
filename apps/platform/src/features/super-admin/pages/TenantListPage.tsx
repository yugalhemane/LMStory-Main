import { useTenants } from '../api/useSuperAdminQueries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from 'ui';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TenantListPage() {
  const { data: tenants, isLoading, error } = useTenants();

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Tenants</h1>
        <div className="h-64 animate-pulse bg-muted/50 rounded-md" />
      </div>
    );
  }

  if (error || !tenants) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-destructive mb-4">Error loading tenants</h1>
        <p className="text-muted-foreground">Could not retrieve tenant data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
        <Button asChild>
          <Link to="/super-admin/tenants/new">
            <Plus className="mr-2 h-4 w-4" /> New Tenant
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant: any) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.code}</TableCell>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      tenant.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {tenant.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/super-admin/tenants/${tenant.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

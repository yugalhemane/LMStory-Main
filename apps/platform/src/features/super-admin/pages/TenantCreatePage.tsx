import { useState } from 'react';
import { useCreateTenant } from '../api/useSuperAdminQueries';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Label, Card, CardContent } from 'ui';
import { toast } from 'react-hot-toast';

export function TenantCreatePage() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    slug: '',
    domain: '',
  });
  
  const { mutate: createTenant, isPending } = useCreateTenant();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenant(formData, {
      onSuccess: () => {
        toast.success('Tenant created successfully');
        navigate('/super-admin/tenants');
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Failed to create tenant');
      }
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Create Tenant</h2>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Tenant Code</Label>
              <Input
                id="code"
                required
                placeholder="e.g. ACME"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Tenant Name</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Acme Corp"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Unique)</Label>
              <Input
                id="slug"
                required
                placeholder="e.g. acme"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain (Optional)</Label>
              <Input
                id="domain"
                placeholder="e.g. learn.acmecorp.com"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/super-admin/tenants')} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Tenant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

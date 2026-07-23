import { useState, useEffect } from 'react';
import { useTenantBranding, useUpdateTenantBranding } from '../api/useSettingsQueries';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Save, Layout, Palette, Building2, Link as LinkIcon, Info } from 'lucide-react';

export function SettingsPage() {
  const { data: branding, isLoading } = useTenantBranding();
  const { mutate: updateBranding, isPending } = useUpdateTenantBranding();

  const [formData, setFormData] = useState({
    companyName: '',
    primaryColor: '',
    dashboardTheme: 'LIGHT',
    logoUrl: '',
    faviconUrl: '',
    supportEmail: '',
  });

  useEffect(() => {
    if (branding) {
      setFormData({
        companyName: branding.companyName || '',
        primaryColor: branding.primaryColor || '',
        dashboardTheme: branding.dashboardTheme || 'LIGHT',
        logoUrl: branding.logoUrl || '',
        faviconUrl: branding.faviconUrl || '',
        supportEmail: branding.supportEmail || '',
      });
    }
  }, [branding]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Settings</h1>
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(formData, {
      onSuccess: () => {
        toast.success('Branding settings updated successfully');
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Failed to update settings');
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tenant Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your white-label branding and platform configuration.</p>
        </div>
        <Button onClick={handleSubmit} disabled={isPending} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar (Visual Only) */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="flex flex-col space-y-1">
            <button className="flex items-center gap-3 px-4 py-3 bg-secondary/10 text-secondary font-medium rounded-lg transition-colors">
              <Palette className="w-5 h-5" />
              Branding & UI
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted/50 font-medium rounded-lg transition-colors cursor-not-allowed opacity-70" title="Coming Soon">
              <Building2 className="w-5 h-5" />
              General Info
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted/50 font-medium rounded-lg transition-colors cursor-not-allowed opacity-70" title="Coming Soon">
              <Layout className="w-5 h-5" />
              Modules
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Applied Settings Section */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-foreground">Active Configuration</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-7">These settings are actively applied to your tenant experience.</p>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="h-12 bg-background border-border focus:border-secondary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                      placeholder="support@acme.com"
                      className="h-12 bg-background border-border focus:border-secondary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dashboardTheme" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dashboard Theme</Label>
                    <Select
                      value={formData.dashboardTheme}
                      onValueChange={(val) => setFormData({ ...formData, dashboardTheme: val })}
                    >
                      <SelectTrigger id="dashboardTheme" className="h-12 bg-background border-border focus:border-secondary transition-colors">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LIGHT">Light</SelectItem>
                        <SelectItem value="DARK">Dark</SelectItem>
                        <SelectItem value="SYSTEM">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Persisted but Not Applied Section */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-amber-200 bg-amber-100/50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-bold text-amber-900">Advanced Branding (Not Applied in V1)</h3>
                </div>
                <p className="text-sm text-amber-700 ml-7">
                  These settings are saved to your tenant configuration but are explicitly not consumed by the V1 UI due to backend limitations.
                </p>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100/50 p-3 rounded-lg border border-amber-200 mb-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <p>URL inputs are required as file upload infrastructure is not yet available.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-sm font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> Logo URL
                    </Label>
                    <Input
                      id="logoUrl"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="h-12 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl" className="text-sm font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> Favicon URL
                    </Label>
                    <Input
                      id="faviconUrl"
                      value={formData.faviconUrl}
                      onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                      placeholder="https://example.com/favicon.ico"
                      className="h-12 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-sm font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Primary Color
                    </Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-12 h-12 rounded-lg border border-amber-200 shrink-0" 
                        style={{ backgroundColor: formData.primaryColor || '#0F172A' }}
                      />
                      <Input
                        id="primaryColor"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        placeholder="#0F172A"
                        className="h-12 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 transition-colors uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

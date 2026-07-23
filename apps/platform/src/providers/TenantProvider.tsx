import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useTenantStore } from '../store/tenant.store';
import { tenantApi } from 'api';

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user } = useAuthStore();
  const { setBranding, branding, clearTenant } = useTenantStore();

  useEffect(() => {
    // We only fetch branding if the user is authenticated and has a tenantId
    if (user?.tenantId && !branding) {
      tenantApi.getBranding().then((response: any) => {
        if (response && typeof response === 'object') {
          setBranding(response);
          // Explicit whitelist to prevent arbitrary/malicious CSS injection
          const allowedVariables = [
            'background', 'foreground', 'card', 'card-foreground',
            'popover', 'popover-foreground', 'primary', 'primary-foreground',
            'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
            'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
            'border', 'input', 'ring', 'radius'
          ];
          
          const root = document.documentElement;
          Object.entries(response).forEach(([key, value]) => {
            if (typeof value === 'string') {
              const cssKey = key.replace(/^--/, ''); // normalize
              if (allowedVariables.includes(cssKey)) {
                // simple regex to ensure value doesn't break out of the property
                if (/^[a-zA-Z0-9\s#%.,()-]+$/.test(value)) {
                  root.style.setProperty(`--${cssKey}`, value);
                } else {
                  console.warn(`Blocked invalid CSS value for branding key: ${cssKey}`);
                }
              }
            }
          });
        }
      }).catch((err: any) => {
        console.error('Failed to fetch tenant branding', err);
      });
    }
    
    // Clear tenant branding if tenant context is lost
    if (!user?.tenantId && branding) {
      clearTenant();
    }
  }, [user?.tenantId, branding, setBranding, clearTenant]);

  return <>{children}</>;
}

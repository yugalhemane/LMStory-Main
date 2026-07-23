import { create } from 'zustand';

interface TenantState {
  branding: Record<string, string> | null;
  setBranding: (branding: Record<string, string>) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  branding: null,
  setBranding: (branding) => set({ branding }),
  clearTenant: () => set({ branding: null }),
}));

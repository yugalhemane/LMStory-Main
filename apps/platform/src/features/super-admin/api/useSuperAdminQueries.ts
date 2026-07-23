import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from 'api';

export const superAdminKeys = {
  all: ['superAdmin'] as const,
  tenants: () => [...superAdminKeys.all, 'tenants'] as const,
  tenant: (id: string) => [...superAdminKeys.tenants(), id] as const,
};

export function useTenants() {
  return useQuery({
    queryKey: superAdminKeys.tenants(),
    queryFn: () => tenantApi.listTenants(),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: superAdminKeys.tenant(id),
    queryFn: () => tenantApi.getTenant(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => tenantApi.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superAdminKeys.tenants() });
    },
  });
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => tenantApi.updateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superAdminKeys.tenant(id) });
      queryClient.invalidateQueries({ queryKey: superAdminKeys.tenants() });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantApi.deleteTenant(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: superAdminKeys.tenant(id) });
      queryClient.invalidateQueries({ queryKey: superAdminKeys.tenants() });
    },
  });
}

export function useRestoreTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantApi.restoreTenant(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: superAdminKeys.tenant(id) });
      queryClient.invalidateQueries({ queryKey: superAdminKeys.tenants() });
    },
  });
}

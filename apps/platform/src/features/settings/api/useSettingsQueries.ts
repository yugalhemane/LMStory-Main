import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from 'api';

export const settingsKeys = {
  all: ['settings'] as const,
  branding: () => [...settingsKeys.all, 'branding'] as const,
};

export function useTenantBranding() {
  return useQuery({
    queryKey: settingsKeys.branding(),
    queryFn: () => tenantApi.getBranding(),
  });
}

export function useUpdateTenantBranding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => tenantApi.updateBranding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.branding() });
    },
  });
}

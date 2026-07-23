import { apiClient } from './ApiClient';

export const tenantApi = {
  // Tenant Branding (TENANT_ADMIN / SUPER_ADMIN)
  getBranding: async () => {
    const response = await apiClient.get('/tenant-branding');
    return response.data?.data;
  },
  updateBranding: async (data: Record<string, any>) => {
    const response = await apiClient.patch('/tenant-branding', data);
    return response.data?.data;
  },

  // Tenant Management (SUPER_ADMIN ONLY)
  listTenants: async () => {
    const response = await apiClient.get('/tenant');
    return response.data?.data;
  },
  getTenant: async (id: string) => {
    const response = await apiClient.get(`/tenant/${id}`);
    return response.data?.data;
  },
  createTenant: async (data: Record<string, any>) => {
    const response = await apiClient.post('/tenant', data);
    return response.data?.data;
  },
  updateTenant: async (id: string, data: Record<string, any>) => {
    const response = await apiClient.patch(`/tenant/${id}`, data);
    return response.data?.data;
  },
  deleteTenant: async (id: string) => {
    const response = await apiClient.delete(`/tenant/${id}`);
    return response.data?.data;
  },
  restoreTenant: async (id: string) => {
    const response = await apiClient.post(`/tenant/${id}/restore`);
    return response.data?.data;
  }
};

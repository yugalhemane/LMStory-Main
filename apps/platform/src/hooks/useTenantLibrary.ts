import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantLibraryApi, UpdateTenantLibraryDto, ImportGlobalContentDto } from 'api';

export const useTenantLibraryContentList = (params?: any) => {
  return useQuery({
    queryKey: ['tenantLibrary', params],
    queryFn: () => tenantLibraryApi.listContent(params).then((res) => res.data.data),
  });
};

export const useTenantLibraryContent = (id: string) => {
  return useQuery({
    queryKey: ['tenantLibraryItem', id],
    queryFn: () => tenantLibraryApi.getContent(id).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useImportTenantLibraryContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportGlobalContentDto) => tenantLibraryApi.importContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantLibrary'] });
    },
  });
};

export const useUpdateTenantLibraryContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantLibraryDto }) => tenantLibraryApi.updateContent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tenantLibrary'] });
      queryClient.invalidateQueries({ queryKey: ['tenantLibraryItem', id] });
    },
  });
};

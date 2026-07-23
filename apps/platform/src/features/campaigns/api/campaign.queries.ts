import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi, CreateCampaignDto, UpdateCampaignDto, Campaign } from 'api';

export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: string) => [...campaignKeys.lists(), { filters }] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

export const useCampaigns = (filters?: any) => {
  return useQuery({
    queryKey: campaignKeys.list(JSON.stringify(filters || {})),
    queryFn: () => campaignApi.listCampaigns(filters).then((res: any) => res.data as { data: Campaign[]; meta: any }),
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignApi.getCampaign(id).then((res: any) => res.data as Campaign),
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignDto) => campaignApi.createCampaign(data).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignDto }) => campaignApi.updateCampaign(id, data).then((res: any) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) });
    },
  });
};

export const useAttachCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, courseId }: { campaignId: string; courseId: string }) => campaignApi.attachCourse(campaignId, courseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.campaignId) });
    },
  });
};

export const useRemoveCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, courseId }: { campaignId: string; courseId: string }) => campaignApi.removeCourse(campaignId, courseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.campaignId) });
    },
  });
};

export const useAssignGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, groupId }: { campaignId: string; groupId: string }) => campaignApi.assignGroup(campaignId, groupId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.campaignId) });
    },
  });
};

export const useUnassignGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, groupId }: { campaignId: string; groupId: string }) => campaignApi.unassignGroup(campaignId, groupId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.campaignId) });
    },
  });
};

export const usePublishCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignApi.publishCampaign(id).then((res: any) => res.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
    },
  });
};

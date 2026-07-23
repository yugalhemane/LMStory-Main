import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi, CreateGroupDto, UpdateGroupDto, Group, GroupMember } from 'api';

export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (filters: string) => [...groupKeys.lists(), { filters }] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  members: (id: string) => [...groupKeys.detail(id), 'members'] as const,
};

export const useGroups = (filters?: any) => {
  return useQuery({
    queryKey: groupKeys.list(JSON.stringify(filters || {})),
    queryFn: () => groupApi.listGroups(filters).then((res: any) => res.data as { data: Group[]; meta: any }),
  });
};

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => groupApi.getGroup(id).then((res: any) => res.data as Group),
    enabled: !!id,
  });
};

export const useGroupMembers = (id: string, params?: any) => {
  return useQuery({
    queryKey: [...groupKeys.members(id), JSON.stringify(params || {})],
    queryFn: () => groupApi.listMembers(id, params).then((res: any) => res.data as { data: GroupMember[]; meta: any }),
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupDto) => groupApi.createGroup(data).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupDto }) => groupApi.updateGroup(id, data).then((res: any) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.id) });
    },
  });
};

export const useAddMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => groupApi.addMember(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.members(variables.groupId) });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => groupApi.removeMember(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.members(variables.groupId) });
    },
  });
};

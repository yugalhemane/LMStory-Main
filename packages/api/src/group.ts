import { apiClient as api } from './ApiClient';

export type GroupType = 'STATIC' | 'DYNAMIC' | 'SYSTEM';

export interface Group {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  type: GroupType;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  code: string;
  description?: string;
  color?: string;
  type?: GroupType;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  department?: string;
  joinedAt: string;
}

export const groupApi = {
  createGroup: (data: CreateGroupDto) => 
    api.post<Group>('/api/groups', data),
  
  getGroup: (id: string) => 
    api.get<Group>(`/api/groups/${id}`),
  
  listGroups: (params?: any) => 
    api.get<{ data: Group[]; meta: any }>('/api/groups', { params }),
  
  updateGroup: (id: string, data: UpdateGroupDto) => 
    api.patch<Group>(`/api/groups/${id}`, data),
    
  deleteGroup: (id: string) => 
    api.delete<void>(`/api/groups/${id}`),

  restoreGroup: (id: string) => 
    api.post<Group>(`/api/groups/${id}/restore`),

  // Members
  addMember: (groupId: string, userId: string) => 
    api.post<void>(`/api/groups/${groupId}/members`, { userId }),
    
  removeMember: (groupId: string, userId: string) => 
    api.delete<void>(`/api/groups/${groupId}/members/${userId}`),
    
  listMembers: (groupId: string, params?: any) => 
    api.get<{ data: GroupMember[]; meta: any }>(`/api/groups/${groupId}/members`, { params }),
};

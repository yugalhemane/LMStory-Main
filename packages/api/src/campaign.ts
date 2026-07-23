import { apiClient as api } from './ApiClient';

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  timezone: string;
  startDate: string | null;
  endDate: string | null;
  enrollmentWindowStart: string | null;
  enrollmentWindowEnd: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  courses?: any[]; // Full relations are often complex, but we can type them simply here
  targetGroups?: any[];
  targetUsers?: any[];
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  enrollmentWindowStart?: string;
  enrollmentWindowEnd?: string;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

export const campaignApi = {
  createCampaign: (data: CreateCampaignDto) => 
    api.post<Campaign>('/api/campaigns', data),
  
  getCampaign: (id: string) => 
    api.get<Campaign>(`/api/campaigns/${id}`),
  
  listCampaigns: (params?: any) => 
    api.get<{ data: Campaign[]; meta: any }>('/api/campaigns', { params }),
  
  updateCampaign: (id: string, data: UpdateCampaignDto) => 
    api.patch<Campaign>(`/api/campaigns/${id}`, data),
    
  deleteCampaign: (id: string) => 
    api.delete<void>(`/api/campaigns/${id}`),

  restoreCampaign: (id: string) => 
    api.post<Campaign>(`/api/campaigns/${id}/restore`),

  publishCampaign: (id: string) => 
    api.post<Campaign>(`/api/campaigns/${id}/publish`),

  pauseCampaign: (id: string) => 
    api.post<Campaign>(`/api/campaigns/${id}/pause`),

  // Attachments
  attachCourse: (id: string, courseId: string) => 
    api.post<void>(`/api/campaigns/${id}/courses`, { courseId }),
    
  removeCourse: (id: string, courseId: string) => 
    api.delete<void>(`/api/campaigns/${id}/courses/${courseId}`),
    
  assignGroup: (id: string, groupId: string) => 
    api.post<void>(`/api/campaigns/${id}/groups`, { groupId }),
    
  unassignGroup: (id: string, groupId: string) => 
    api.delete<void>(`/api/campaigns/${id}/groups/${groupId}`),

  assignUser: (id: string, userId: string) => 
    api.post<void>(`/api/campaigns/${id}/users`, { userId }),
    
  unassignUser: (id: string, userId: string) => 
    api.delete<void>(`/api/campaigns/${id}/users/${userId}`),
};

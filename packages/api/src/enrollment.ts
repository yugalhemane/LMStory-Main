import { apiClient as api } from './ApiClient';

export type EnrollmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export interface Enrollment {
  id: string;
  tenantId: string;
  campaignId: string;
  userId: string;
  code: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  score: number | null;
  timeSpentSeconds: number;
  enrolledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BulkEnrollmentDto {
  campaignId: string;
  userIds: string[];
}

export const enrollmentApi = {
  bulkEnroll: (data: BulkEnrollmentDto) => 
    api.post<{ message: string }>('/api/enrollments/bulk', data),
  
  getEnrollment: (id: string) => 
    api.get<Enrollment>(`/api/enrollments/${id}`),
  
  listEnrollments: (params?: any) => 
    api.get<{ data: Enrollment[]; meta: any }>('/api/enrollments', { params }),
    
  deleteEnrollment: (id: string) => 
    api.delete<void>(`/api/enrollments/${id}`),
};

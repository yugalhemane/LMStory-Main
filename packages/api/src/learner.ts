import { apiClient } from './ApiClient';

// Interfaces for Learner Data
export interface LearnerDashboardResponse {
  active: any[]; // Depending on exact prisma return shape
  upcoming: any[];
  completed: any[];
  continueLearning: any | null;
  summary: Record<string, number>;
}

export interface EnrollmentDetailsResponse {
  id: string;
  tenantId: string;
  userId: string;
  campaignId: string;
  status: string;
  courses: Array<{
    id: string;
    enrollmentId: string;
    campaignCourseId: string;
    status: string;
    progressPercentage: number;
    campaignCourse: {
      course: {
        id: string;
        title: string;
        sections: Array<{
          id: string;
          title: string;
          order: number;
          items: Array<{
            id: string;
            order: number;
            itemType: string;
            tenantLibrary: {
              id: string;
              title: string;
              contentType: string;
              estimatedDuration?: number;
            };
          }>;
        }>;
      };
    };
    progress: Array<{
      id: string;
      courseItemId: string;
      status: string;
      score?: number;
      resumePosition?: string;
    }>;
  }>;
}

export interface UpdateProgressDto {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  timeSpentSeconds?: number;
  score?: number;
  resumePosition?: string;
}

export interface UpdateProgressResponse {
  success: boolean;
  progressPercentage: number;
  courseStatus: string;
}

export interface PlaybackResponse {
  url: string | null;
  type: string;
}

export const LearnerAPI = {
  getDashboard: async (): Promise<LearnerDashboardResponse> => {
    const response = await apiClient.get<{ data: LearnerDashboardResponse }>('/api/learner/dashboard');
    return response.data.data;
  },

  getEnrollmentDetails: async (enrollmentId: string): Promise<EnrollmentDetailsResponse> => {
    const response = await apiClient.get<{ data: EnrollmentDetailsResponse }>(`/api/learner/enrollments/${enrollmentId}`);
    return response.data.data;
  },

  updateProgress: async (progressId: string, data: UpdateProgressDto): Promise<UpdateProgressResponse> => {
    const response = await apiClient.patch<{ data: UpdateProgressResponse }>(`/api/learner/progress/${progressId}`, data);
    return response.data.data;
  },

  // V1.1 Explicit Events
  markViewed: async (progressId: string): Promise<UpdateProgressResponse> => {
    const response = await apiClient.post<{ data: UpdateProgressResponse }>(`/api/learner/progress/${progressId}/view`);
    return response.data.data;
  },

  markCompleted: async (progressId: string): Promise<UpdateProgressResponse> => {
    const response = await apiClient.post<{ data: UpdateProgressResponse }>(`/api/learner/progress/${progressId}/complete`);
    return response.data.data;
  },

  getPlaybackUrl: async (progressId: string): Promise<PlaybackResponse> => {
    const response = await apiClient.get<{ data: PlaybackResponse }>(`/api/learner/progress/${progressId}/playback`);
    return response.data.data;
  }
};

import { apiClient } from './ApiClient';

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  totalCourses: number;
  publishedCourses: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalEnrollments: number;
  completedEnrollments: number;
  certificatesIssued: number;
  completionRate: number;
  averageProgress: number;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}

export interface UserReportItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  designation: string | null;
  status: string;
  joinedAt: string;
  isActive: boolean;
  _count: {
    enrollments: number;
    certificates: number;
  };
}

export interface UserReportResponse {
  success: boolean;
  message: string;
  data: {
    data: UserReportItem[];
    total: number;
  };
}

export interface CourseReportItem {
  id: string;
  title: string;
  status: string;
  enrollmentCount: number;
  completionCount: number;
  completionRate: number;
  averageProgress: number;
  averageTimeSpent: number;
  averageScore: number;
}

export interface CourseReportResponse {
  success: boolean;
  message: string;
  data: CourseReportItem[];
}

export const reportApi = {
  getDashboardSummary: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>('/reports/dashboard');
    return response.data;
  },
  
  getUsersReport: async (params?: Record<string, any>): Promise<UserReportResponse> => {
    const response = await apiClient.get<UserReportResponse>('/reports/users', { params });
    return response.data;
  },

  getCoursesReport: async (): Promise<CourseReportResponse> => {
    const response = await apiClient.get<CourseReportResponse>('/reports/courses');
    return response.data;
  },
};

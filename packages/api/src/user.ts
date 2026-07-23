import { apiClient } from './ApiClient';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string | null;
  designation?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  isActive: boolean;
  joinedAt?: string | null;
  _count?: {
    enrollments: number;
    certificates: number;
  };
}

export interface PaginatedUsers {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Optional if auto-generated, but required in Prisma without default
  department?: string;
  designation?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: PaginatedUsers;
}

export const userApi = {
  listUsers: async (params?: ListUsersQuery): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse>('/users', { params });
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  deactivateUser: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>(`/users/${id}/deactivate`);
    return response.data;
  },

  activateUser: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>(`/users/${id}/activate`);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
  },
};

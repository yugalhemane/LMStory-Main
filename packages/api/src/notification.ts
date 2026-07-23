import { apiClient } from './ApiClient';

export interface Notification {
  id: string;
  type: 'SYSTEM' | 'ALERT' | 'MESSAGE' | 'REMINDER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  title: string;
  body: string;
  actionUrl?: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreference {
  id: string;
  type: 'SYSTEM' | 'ALERT' | 'MESSAGE' | 'REMINDER';
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  isEnabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  code: string;
  type: 'SYSTEM' | 'ALERT' | 'MESSAGE' | 'REMINDER';
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  subject?: string;
  body: string;
  isActive: boolean;
}

export const notificationApi = {
  // Learner Scope
  getMyNotifications: async (page = 1, limit = 10): Promise<{ data: Notification[], total: number }> => {
    const response = await apiClient.get('/api/notifications', { params: { page, limit } });
    return response.data.data;
  },

  getNotification: async (id: string): Promise<Notification> => {
    const response = await apiClient.get(`/api/notifications/${id}`);
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch(`/api/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await apiClient.patch('/api/notifications/read-all');
    return response.data.data;
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/notifications/${id}`);
  },

  getPreferences: async (): Promise<NotificationPreference[]> => {
    const response = await apiClient.get('/api/notifications/preferences');
    return response.data.data;
  },

  updatePreference: async (type: string, channel: string, isEnabled: boolean): Promise<NotificationPreference> => {
    const response = await apiClient.patch('/api/notifications/preferences', { type, channel, isEnabled });
    return response.data.data;
  },

  // Admin Scope (Templates)
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get('/api/notifications/templates');
    return response.data.data;
  },

  createTemplate: async (data: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
    const response = await apiClient.post('/api/notifications/templates', data);
    return response.data.data;
  },

  updateTemplate: async (id: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
    const response = await apiClient.patch(`/api/notifications/templates/${id}`, data);
    return response.data.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/notifications/templates/${id}`);
  }
};

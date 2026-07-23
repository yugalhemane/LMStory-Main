import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, NotificationTemplate } from 'api';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page: number, limit: number) => [...notificationKeys.all, 'list', page, limit] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  templates: () => [...notificationKeys.all, 'templates'] as const,
};

// --- Notifications (Learner) ---
export function useNotifications(page = 1, limit = 10) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit),
    queryFn: () => notificationApi.getMyNotifications(page, limit),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// --- Preferences (Learner) ---
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: notificationApi.getPreferences,
  });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, channel, isEnabled }: { type: string; channel: string; isEnabled: boolean }) =>
      notificationApi.updatePreference(type, channel, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
  });
}

// --- Templates (Admin) ---
export function useNotificationTemplates() {
  return useQuery({
    queryKey: notificationKeys.templates(),
    queryFn: notificationApi.getTemplates,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationTemplate>) => notificationApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() });
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NotificationTemplate> }) => notificationApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() });
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() });
    },
  });
}

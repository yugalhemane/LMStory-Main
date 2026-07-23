import { useQuery } from '@tanstack/react-query';
import { reportApi } from 'api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => reportApi.getDashboardSummary(),
  });
}

export function useUsersReport(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['reports', 'users', params],
    queryFn: () => reportApi.getUsersReport(params),
  });
}

export function useCoursesReport() {
  return useQuery({
    queryKey: ['reports', 'courses'],
    queryFn: () => reportApi.getCoursesReport(),
  });
}

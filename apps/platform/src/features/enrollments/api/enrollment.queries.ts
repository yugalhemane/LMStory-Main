import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Enrollment, enrollmentApi, BulkEnrollmentDto } from 'api';

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (filters: string) => [...enrollmentKeys.lists(), { filters }] as const,
};

export const useEnrollments = (filters?: any) => {
  return useQuery({
    queryKey: enrollmentKeys.list(JSON.stringify(filters || {})),
    queryFn: () => enrollmentApi.listEnrollments(filters).then((res: any) => res.data as { data: Enrollment[]; meta: any }),
  });
};

export const useBulkEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkEnrollmentDto) => enrollmentApi.bulkEnroll(data).then((res: any) => res.data),
    onSuccess: () => {
      // Invalidate enrollments list and the specific campaign's details if needed
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
    },
  });
};

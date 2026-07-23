import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LearnerAPI, UpdateProgressDto } from 'api';

export const learnerKeys = {
  all: ['learner'] as const,
  dashboard: () => [...learnerKeys.all, 'dashboard'] as const,
  enrollments: () => [...learnerKeys.all, 'enrollment'] as const,
  enrollment: (id: string) => [...learnerKeys.enrollments(), id] as const,
};

export const useLearnerDashboard = () => {
  return useQuery({
    queryKey: learnerKeys.dashboard(),
    queryFn: LearnerAPI.getDashboard,
  });
};

export const useEnrollmentDetails = (enrollmentId: string) => {
  return useQuery({
    queryKey: learnerKeys.enrollment(enrollmentId),
    queryFn: () => LearnerAPI.getEnrollmentDetails(enrollmentId),
    enabled: !!enrollmentId,
  });
};

export const useUpdateProgress = (enrollmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ progressId, data }: { progressId: string; data: UpdateProgressDto }) =>
      LearnerAPI.updateProgress(progressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerKeys.enrollment(enrollmentId) });
      queryClient.invalidateQueries({ queryKey: learnerKeys.dashboard() });
    },
  });
};

export const usePlaybackUrl = (progressId?: string) => {
  return useQuery({
    queryKey: ['playback', progressId],
    queryFn: () => LearnerAPI.getPlaybackUrl(progressId!),
    enabled: !!progressId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useMarkViewed = (enrollmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (progressId: string) => LearnerAPI.markViewed(progressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerKeys.enrollment(enrollmentId) });
      queryClient.invalidateQueries({ queryKey: learnerKeys.dashboard() });
    },
  });
};

export const useMarkCompleted = (enrollmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (progressId: string) => LearnerAPI.markCompleted(progressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerKeys.enrollment(enrollmentId) });
      queryClient.invalidateQueries({ queryKey: learnerKeys.dashboard() });
    },
  });
};

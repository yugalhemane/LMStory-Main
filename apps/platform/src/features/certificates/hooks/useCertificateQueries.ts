import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificateApi } from 'api';

export const certificateKeys = {
  all: ['certificates'] as const,
  my: () => [...certificateKeys.all, 'my'] as const,
  verify: (token: string) => [...certificateKeys.all, 'verify', token] as const,
};

export function useMyCertificates() {
  return useQuery({
    queryKey: certificateKeys.my(),
    queryFn: certificateApi.getMyCertificates,
  });
}

export function useVerifyCertificate(token: string) {
  return useQuery({
    queryKey: certificateKeys.verify(token),
    queryFn: () => certificateApi.verifyPublicToken(token),
    enabled: !!token,
    retry: false, // Don't retry on 404
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => certificateApi.issueCertificate(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
  });
}

export function useRevokeCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => certificateApi.revokeCertificate(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
  });
}

import { apiClient } from './ApiClient';
import { User } from './index';
import { Course } from './course';

export interface EnrollmentCertificate {
  id: string;
  certificateCode: string;
  issuedAt: string;
  status: 'ISSUED' | 'REVOKED';
  user: Pick<User, 'firstName' | 'lastName'>;
  course: Pick<Course, 'title'>;
  tenant?: { name: string };
  revocationReason?: string;
  revokedAt?: string;
}

export const certificateApi = {
  getMyCertificates: async (): Promise<EnrollmentCertificate[]> => {
    const response = await apiClient.get('/api/certificates/my');
    return response.data.data;
  },

  verifyPublicToken: async (token: string): Promise<EnrollmentCertificate> => {
    const response = await apiClient.get(`/api/certificates/public/verify/${token}`);
    return response.data.data;
  },

  issueCertificate: async (enrollmentId: string): Promise<EnrollmentCertificate> => {
    const response = await apiClient.post(`/api/certificates/issue/${enrollmentId}`);
    return response.data.data;
  },

  revokeCertificate: async (id: string, revocationReason: string): Promise<EnrollmentCertificate> => {
    const response = await apiClient.post(`/api/certificates/${id}/revoke`, { revocationReason });
    return response.data.data;
  }
};

import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { prismaMock } from '../setup';
import certificateRoutes from '../../src/modules/certificate/routes/certificate.routes';
import { Role } from '@prisma/client';
import { errorHandler } from '../../src/middlewares/errorHandler';

const app = express();
app.use(express.json());

// Mock requireAuth to inject a Tenant A admin user
jest.mock('../../src/modules/auth/middleware/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = {
      userId: 'admin-a',
      tenantId: 'tenant-A',
      role: req.headers.authorization === 'Bearer learner-token' ? Role.LEARNER : Role.TENANT_ADMIN
    };
    next();
  }
}));

app.use('/api/certificates', certificateRoutes);
app.use(errorHandler);

describe('Module 8: Certificates Isolation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock prisma.$transaction to execute the callback with prismaMock
    (prismaMock.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
      if (typeof callback === 'function') {
        return await callback(prismaMock);
      }
      return Promise.all(callback);
    });
  });

  describe('IDOR & Isolation Tests', () => {
    it('Tenant A admin cannot issue a certificate for Tenant B enrollment', async () => {
      // Mock enrollment belonging to Tenant B not found for Tenant A admin
      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/certificates/issue/enrollment-B`)
        .set('Authorization', `Bearer admin-token`);

      expect(res.status).toBe(404);
    });

    it('Tenant A admin can issue a certificate for their own enrollment', async () => {
      // Mock enrollment belonging to Tenant A
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enrollment-A',
        tenantId: 'tenant-A',
        userId: 'user-a',
        campaignId: 'camp-a',
        code: 'ENR',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
        courses: [{ courseId: 'c1', courseVersion: 1, status: 'COMPLETED' }]
      } as any);

      // Mock certificate check (not exists)
      prismaMock.enrollmentCertificate.findFirst.mockResolvedValue(null);

      // Mock certificate creation
      prismaMock.enrollmentCertificate.create.mockResolvedValue({
        id: 'cert-1',
        certificateCode: 'CERT-123',
        status: 'ISSUED',
        enrollmentId: 'enrollment-A',
        tenantId: 'tenant-A',
        issuedAt: new Date(),
        revocationReason: null,
        revokedAt: null
      } as any);

      const res = await request(app)
        .post(`/api/certificates/issue/enrollment-A`)
        .set('Authorization', `Bearer admin-token`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.certificateCode).toBe('CERT-123');
    });

    it('Repeated manual issuance follows idempotency/unique-constraint (returns 409 Conflict)', async () => {
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enrollment-A',
        tenantId: 'tenant-A',
        userId: 'user-a',
        campaignId: 'camp-a',
        code: 'ENR',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
        courses: [{ courseId: 'c1', courseVersion: 1, status: 'COMPLETED' }]
      } as any);

      // Certificate already exists
      prismaMock.enrollmentCertificate.findFirst.mockResolvedValue({
        id: 'cert-1',
        certificateCode: 'CERT-123',
        status: 'ISSUED',
        enrollmentId: 'enrollment-A',
        tenantId: 'tenant-A',
        issuedAt: new Date(),
        revocationReason: null,
        revokedAt: null
      } as any);

      const res = await request(app)
        .post(`/api/certificates/issue/enrollment-A`)
        .set('Authorization', `Bearer admin-token`);

      expect(res.status).toBe(409);
    });

    it('Learner gets 403 on TENANT_ADMIN certificate issue endpoint', async () => {
      const res = await request(app)
        .post(`/api/certificates/issue/enrollment-A`)
        .set('Authorization', `Bearer learner-token`);

      expect(res.status).toBe(403);
    });
  });
});

import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { prismaMock } from '../setup';

jest.mock('../../src/modules/auth/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    const role = req.headers['x-mock-role'];
    const tenantId = req.headers['x-mock-tenant-id'];
    if (!role || !tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    req.user = { userId: 'mock-user-id', role, tenantId };
    next();
  }
}));

import tenantBrandingRoutes from '../../src/modules/tenantBranding/routes/tenantBranding.routes';

const app = express();
app.use(express.json());
app.use('/api/tenant-branding', tenantBrandingRoutes);

describe('Tenant Settings Security Isolation', () => {
  beforeEach(() => {
    // Reset mocks before each test
    prismaMock.tenantSettings.findUnique.mockReset();
    prismaMock.tenantSettings.upsert.mockReset();
  });

  describe('PATCH /api/tenant-branding', () => {
    it('Tenant Admin 1 updates branding -> upserts with Tenant 1 ID', async () => {
      const payload = { companyName: 'Acme One' };

      prismaMock.tenantSettings.findUnique.mockResolvedValue({
        id: 'ts-1', tenantId: 'tenant-1', branding: {}
      } as any);

      prismaMock.tenantSettings.upsert.mockResolvedValue({
        id: 'ts-1', tenantId: 'tenant-1', branding: { companyName: 'Acme One' }
      } as any);

      const res = await request(app)
        .patch('/api/tenant-branding')
        .set('x-mock-role', 'TENANT_ADMIN')
        .set('x-mock-tenant-id', 'tenant-1')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.companyName).toBe('Acme One');
      
      // Verify isolation check in the mocked service layer
      expect(prismaMock.tenantSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' }
        })
      );
    });

    it('Tenant Admin 2 updates branding -> upserts with Tenant 2 ID', async () => {
      const payload = { companyName: 'Acme Two' };

      prismaMock.tenantSettings.findUnique.mockResolvedValue({
        id: 'ts-2', tenantId: 'tenant-2', branding: {}
      } as any);

      prismaMock.tenantSettings.upsert.mockResolvedValue({
        id: 'ts-2', tenantId: 'tenant-2', branding: { companyName: 'Acme Two' }
      } as any);

      const res = await request(app)
        .patch('/api/tenant-branding')
        .set('x-mock-role', 'TENANT_ADMIN')
        .set('x-mock-tenant-id', 'tenant-2')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.companyName).toBe('Acme Two');
      
      // Verify isolation check in the mocked service layer
      expect(prismaMock.tenantSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-2' }
        })
      );
    });
  });
});

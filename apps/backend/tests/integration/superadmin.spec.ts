import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { prismaMock } from '../setup';

jest.mock('../../src/modules/auth/middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    const role = req.headers['x-mock-role'];
    if (!role) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    req.user = { userId: 'mock-user-id', role, tenantId: 'mock-tenant-id' };
    next();
  }
}));

jest.mock('../../src/shared/middlewares/requireRole', () => ({
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  }
}));

jest.mock('../../src/shared/middlewares/requireSuperAdmin', () => ({
  requireSuperAdmin: (req: any, res: any, next: any) => {
    if (req.user?.role !== 'SUPER_ADMIN') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  }
}));

import tenantRoutes from '../../src/modules/tenant/routes/tenant.routes';

const app = express();
app.use(express.json());
app.use('/api/tenant', tenantRoutes);

describe('Super Admin Security Integration', () => {
  const payload = {
    code: 'NEW_TEST',
    name: 'New Test Tenant',
    slug: 'new-test-tenant'
  };

  beforeEach(() => {
    prismaMock.tenant.create.mockResolvedValue({ id: 'new-id', ...payload } as any);
  });

  describe('Tenant Management API (/api/tenant)', () => {
    it('Unauthenticated request -> expected authentication failure (401)', async () => {
      const res = await request(app).post('/api/tenant').send(payload);
      expect(res.status).toBe(401);
    });

    it('LEARNER -> 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/tenant')
        .set('x-mock-role', 'LEARNER')
        .send(payload);
      expect(res.status).toBe(403);
    });

    it('TRAINER -> 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/tenant')
        .set('x-mock-role', 'TRAINER')
        .send(payload);
      expect(res.status).toBe(403);
    });

    it('TENANT_ADMIN -> 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/tenant')
        .set('x-mock-role', 'TENANT_ADMIN')
        .send(payload);
      expect(res.status).toBe(403);
    });

    it('SUPER_ADMIN -> permitted according to endpoint contract', async () => {
      const res = await request(app)
        .post('/api/tenant')
        .set('x-mock-role', 'SUPER_ADMIN')
        .send(payload);
      
      expect(res.status).toBe(201); // Created
      expect(res.body.data.code).toBe(payload.code);
    });
  });
});

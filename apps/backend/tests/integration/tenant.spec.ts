import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { describe, it, expect, jest } from '@jest/globals';


jest.mock('../../src/modules/auth/middleware/auth.middleware', () => ({
  requireAuth: (req: Request, _res: Response, next: NextFunction) => {
    (req as any).user = {
      userId: 'mock-user',
      tenantId: 'tenant-a-id',
      role: 'TENANT_ADMIN'
    };
    next();
  }
}));

import tenantRoutes from '../../src/modules/tenant/routes/tenant.routes';

const app = express();
app.use(express.json());

// Mock requireTenantAdmin Middleware (since it's inline in routes, we mock it by bypassing or implementing it)
app.use('/api/tenants', tenantRoutes);

describe('Tenant Module Integration (Isolation)', () => {
  it('should deny Tenant Admin to fetch tenant (SUPER_ADMIN only)', async () => {
    const res = await request(app).get('/api/tenants/tenant-a-id');
    expect(res.status).toBe(403);
  });
});

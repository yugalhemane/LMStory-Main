import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { prismaMock } from '../setup';
import userRoutes from '../../src/modules/user/routes/user.routes';
import { Role } from '@prisma/client';

const app = express();
app.use(express.json());

// Mock requireAuth to inject a Tenant A admin user
jest.mock('../../src/modules/auth/middleware/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = {
      userId: 'admin-a',
      tenantId: 'tenant-A',
      role: Role.TENANT_ADMIN
    };
    next();
  }
}));

app.use('/api/users', userRoutes);

describe('Cross-Tenant Isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Tenant A admin attempting to delete a user should only target Tenant A records', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/users/user-b-id');
    
    // It should evaluate to 404 because findFirst scoped to tenantId: 'tenant-A' will not find user-b-id
    expect(res.status).toBe(404);
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-b-id', tenantId: 'tenant-A', deletedAt: null }
      })
    );
  });
});

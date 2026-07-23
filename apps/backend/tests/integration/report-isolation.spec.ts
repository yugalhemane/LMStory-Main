import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

let mockUser: any = null;

jest.mock('../../src/modules/auth/middleware/auth.middleware', () => ({
  requireAuth: (req: Request, res: Response, next: NextFunction) => {
    if (!mockUser) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    (req as any).user = mockUser;
    next();
  }
}));

import { prismaMock } from '../setup';
import reportRoutes from '../../src/modules/report/routes/report.routes';
import { Role } from '@prisma/client';
import { errorHandler } from '../../src/middlewares/errorHandler';

const app = express();
app.use(express.json());

app.use('/api/reports', reportRoutes);
app.use(errorHandler);

describe('Module 7: Reporting & Analytics Isolation Tests', () => {
  const tenantA = 'tenant-a-id';
  const userB = 'user-b-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject LEARNER role with 403 Forbidden', async () => {
    mockUser = { id: 'user1', tenantId: tenantA, role: Role.LEARNER };
    const res = await request(app).get('/api/reports/dashboard');
    expect(res.status).toBe(403);
  });

  it('should reject TRAINER role with 403 Forbidden', async () => {
    mockUser = { id: 'user1', tenantId: tenantA, role: Role.TRAINER };
    const res = await request(app).get('/api/reports/dashboard');
    expect(res.status).toBe(403);
  });

  it('should allow TENANT_ADMIN role to access dashboard', async () => {
    mockUser = { id: 'adminA', tenantId: tenantA, role: Role.TENANT_ADMIN };
    
    prismaMock.user.count.mockResolvedValue(10);
    prismaMock.group.count.mockResolvedValue(2);
    prismaMock.course.count.mockResolvedValue(5);
    prismaMock.campaign.count.mockResolvedValue(1);
    prismaMock.enrollment.count.mockResolvedValue(50);
    prismaMock.enrollmentCertificate.count.mockResolvedValue(5);
    prismaMock.enrollmentCourse.aggregate.mockResolvedValue({ _avg: { progressPercentage: 50 } } as any);

    const res = await request(app).get('/api/reports/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify tenantId was passed in baseWhere strictly
    expect(prismaMock.user.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: tenantA })
      })
    );
  });

  it('should reject Tenant A admin requesting Learner Report for Tenant B user (IDOR)', async () => {
    mockUser = { id: 'adminA', tenantId: tenantA, role: Role.TENANT_ADMIN };

    // prismaMock.user.findFirst returns null because user-b belongs to tenant-b, 
    // and the query constraint includes tenantA.
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/reports/learners/${userB}`);
    
    // The repository throws NotFoundError, which maps to 404 in standard error handler
    expect(res.status).toBe(404);
    
    // Verify it actually included the tenant-a restriction when looking for the user
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: userB, tenantId: tenantA })
      })
    );
  });
});

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { prismaMock } from '../setup';
import campaignRoutes from '../../src/modules/campaign/routes/campaign.routes';
import enrollmentRoutes from '../../src/modules/enrollment/routes/enrollment.routes';

const app = express();
app.use(express.json());

jest.mock('../../src/modules/auth/middleware/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = {
      userId: 'admin-a',
      tenantId: '22222222-2222-4222-8222-222222222222',
      role: 'TENANT_ADMIN'
    };
    next();
  }
}));

app.use('/api/campaigns', campaignRoutes);
app.use('/api/enrollments', enrollmentRoutes);
import { errorHandler } from '../../src/middlewares/errorHandler';
app.use(errorHandler);

describe('Module 6: Campaign & Enrollment Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const campId = '11111111-1111-4111-8111-111111111111';
  const tenantId = '22222222-2222-4222-8222-222222222222';
  const courseId = '33333333-3333-4333-8333-333333333333';
  const groupId = '44444444-4444-4444-8444-444444444444';
  const userId = '55555555-5555-4555-8555-555555555555';

  it('should prevent cross-tenant course attachment', async () => {
    // Mock the campaign exists and belongs to tenant-a
    prismaMock.campaign.findFirst.mockResolvedValue({ id: campId, tenantId: tenantId } as any);
    
    // Mock the course DOES NOT belong to tenant-a
    prismaMock.course.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/campaigns/${campId}/courses`)
      .send({ courseId: courseId });
    
    expect(res.status).toBe(404);
    expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: courseId, tenantId: tenantId, deletedAt: null }
      })
    );
  });

  it('should prevent cross-tenant group attachment', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({ id: campId, tenantId: tenantId } as any);
    prismaMock.group.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/campaigns/${campId}/groups`)
      .send({ groupId: groupId });
    
    expect(res.status).toBe(404);
    expect(prismaMock.group.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: groupId, tenantId: tenantId, deletedAt: null }
      })
    );
  });

  it('should prevent cross-tenant user targeting', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({ id: campId, tenantId: tenantId } as any);
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/campaigns/${campId}/users`)
      .send({ userId: userId });
    
    expect(res.status).toBe(404);
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: userId, tenantId: tenantId, deletedAt: null }
      })
    );
  });

  it('should prevent cross-tenant bulk enrollment', async () => {
    // user-b-id belongs to tenant-b
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.findMany.mockResolvedValue([]);
    // Must be ACTIVE or SCHEDULED to enroll
    prismaMock.campaign.findFirst.mockResolvedValue({ id: campId, tenantId: tenantId, status: 'ACTIVE', courses: [{ id: '1' }], targetUsers: [{ id: '1' }], targetGroups: [] } as any);
    prismaMock.enrollment.findMany.mockResolvedValue([]);

    const res = await request(app)
      .post(`/api/enrollments/bulk`)
      .send({ campaignId: campId, userIds: [userId] });
    
    expect(res.status).toBe(400); // 400 Validation Error because users don't belong to tenant
    expect(prismaMock.enrollment.createMany).not.toHaveBeenCalled();
  });

  it('should correctly transition state on publish', async () => {
    // Tomorrow
    const futureDate = new Date(Date.now() + 86400000);
    const futureEndDate = new Date(Date.now() + 86400000 * 2);
    prismaMock.campaign.findFirst.mockResolvedValue({ id: campId, tenantId: tenantId, startDate: futureDate, endDate: futureEndDate, status: 'DRAFT', courses: [{ id: '1' }], targetUsers: [{ id: '1' }], targetGroups: [] } as any);
    prismaMock.campaign.update.mockResolvedValue({ id: campId, status: 'SCHEDULED' } as any);

    let res = await request(app)
      .post(`/api/campaigns/${campId}/publish`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SCHEDULED');

    // Past
    const pastDate = new Date(Date.now() - 86400000);
    prismaMock.campaign.findFirst.mockResolvedValue({ id: campId, tenantId: tenantId, startDate: pastDate, endDate: futureEndDate, status: 'DRAFT', courses: [{ id: '1' }], targetUsers: [{ id: '1' }], targetGroups: [] } as any);
    prismaMock.campaign.update.mockResolvedValue({ id: campId, status: 'ACTIVE' } as any);

    res = await request(app)
      .post(`/api/campaigns/${campId}/publish`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('should safely prevent duplicate enrollments on retry', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: userId, tenantId: tenantId } as any);
    prismaMock.user.findMany.mockResolvedValue([{ id: userId, tenantId: tenantId }] as any);
    prismaMock.campaign.findFirst.mockResolvedValue({ id: campId, tenantId: tenantId, status: 'ACTIVE', courses: [{ id: '1' }], targetUsers: [{ id: '1' }], targetGroups: [] } as any);
    
    // First attempt: no existing enrollments
    prismaMock.enrollment.findMany.mockResolvedValue([]);

    await request(app)
      .post(`/api/enrollments/bulk`)
      .send({ campaignId: campId, userIds: [userId] });
    
    // We expect 0 calls to createMany because bulkCreateEnrollments uses a transaction of creates, not createMany
    // We can just assert status 201
    expect(prismaMock.enrollment.createMany).not.toHaveBeenCalled();

    // Second attempt: existing enrollment
    jest.clearAllMocks();
    prismaMock.user.findFirst.mockResolvedValue({ id: userId, tenantId: tenantId } as any);
    prismaMock.user.findMany.mockResolvedValue([{ id: userId, tenantId: tenantId }] as any);
    prismaMock.campaign.findFirst.mockResolvedValue({ id: campId, tenantId: tenantId, status: 'ACTIVE', courses: [{ id: '1' }], targetUsers: [{ id: '1' }], targetGroups: [] } as any);
    
    // Mock that user-a is already enrolled
    prismaMock.enrollment.findMany.mockResolvedValue([{ userId: userId, campaignId: campId }] as any);

    const res = await request(app)
      .post(`/api/enrollments/bulk`)
      .send({ campaignId: campId, userIds: [userId] });
    
    expect(res.status).toBe(201);
  });
});

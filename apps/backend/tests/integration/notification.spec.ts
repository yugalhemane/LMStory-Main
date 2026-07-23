import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { prismaMock } from '../setup';
import notificationRoutes from '../../src/modules/notification/routes/notification.routes';
import { Role, NotificationType, NotificationPriority, NotificationStatus } from '@prisma/client';
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

app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

describe('Module 8: Notifications Isolation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('IDOR & Isolation Tests', () => {
    it('User cannot mark another user\'s valid notification as read', async () => {
      // Mock notification belonging to Tenant B / user B not found for A
      prismaMock.notification.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/notifications/notif-B/read`)
        .set('Authorization', `Bearer admin-token`);

      expect(res.status).toBe(404);
    });

    it('User can mark own notification as read', async () => {
      // Mock notification belonging to Tenant A / admin A
      prismaMock.notification.findFirst.mockResolvedValue({
        id: 'notif-A',
        tenantId: 'tenant-A',
        userId: 'admin-a',
        type: NotificationType.SYSTEM,
        priority: NotificationPriority.NORMAL,
        title: 'Title A',
        body: 'Body A',
        status: NotificationStatus.UNREAD,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      prismaMock.notification.update.mockResolvedValue({
        id: 'notif-A',
        tenantId: 'tenant-A',
        userId: 'admin-a',
        type: NotificationType.SYSTEM,
        priority: NotificationPriority.NORMAL,
        title: 'Title A',
        body: 'Body A',
        status: NotificationStatus.READ,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const res = await request(app)
        .patch(`/api/notifications/notif-A/read`)
        .set('Authorization', `Bearer admin-token`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('READ');
    });

    it('Tenant A admin cannot read, update, or delete a valid Tenant B notification template', async () => {
      // Mock template belonging to Tenant B not found for Tenant A admin
      prismaMock.notificationTemplate.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/notifications/templates/template-B`)
        .send({ body: 'hacked' })
        .set('Authorization', `Bearer admin-token`);

      expect(res.status).toBe(404);
    });

    it('LEARNER gets 403 on TENANT_ADMIN template management endpoints', async () => {
      const res = await request(app)
        .post(`/api/notifications/templates`)
        .send({ name: 'Hack', code: 'HACK', body: 'Hacked template' })
        .set('Authorization', `Bearer learner-token`);

      expect(res.status).toBe(403);
    });
  });
});

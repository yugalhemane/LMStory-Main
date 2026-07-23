import { prisma } from '../../../database/prisma';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../../shared/errors';

export class NotificationRepository {
  // ==============================
  // NOTIFICATIONS (Learner Scope)
  // ==============================
  public async getMyNotifications(tenantId: string, userId: string, skip: number, take: number) {
    const where = { tenantId, userId };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);
    return { data, total };
  }

  public async getNotification(id: string, tenantId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, tenantId, userId }
    });
    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  }

  public async markAsRead(id: string, tenantId: string, userId: string) {
    const notification = await this.getNotification(id, tenantId, userId);
    return prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'READ', readAt: new Date() }
    });
  }

  public async markAllAsRead(tenantId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { tenantId, userId, status: 'UNREAD' },
      data: { status: 'READ', readAt: new Date() }
    });
  }

  public async deleteNotification(id: string, tenantId: string, userId: string) {
    const notification = await this.getNotification(id, tenantId, userId);
    return prisma.notification.delete({
      where: { id: notification.id }
    });
  }

  public async createNotification(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  }

  // ==============================
  // PREFERENCES (Learner Scope)
  // ==============================
  public async getPreferences(tenantId: string, userId: string) {
    return prisma.notificationPreference.findMany({
      where: { tenantId, userId }
    });
  }

  public async upsertPreference(tenantId: string, userId: string, type: any, channel: any, isEnabled: boolean) {
    const existing = await prisma.notificationPreference.findFirst({
      where: { tenantId, userId, type, channel }
    });

    if (existing) {
      return prisma.notificationPreference.update({
        where: { id: existing.id },
        data: { isEnabled }
      });
    } else {
      return prisma.notificationPreference.create({
        data: { tenantId, userId, type, channel, isEnabled }
      });
    }
  }

  public async isChannelEnabledForUser(tenantId: string, userId: string, type: any, channel: any): Promise<boolean> {
    const pref = await prisma.notificationPreference.findFirst({
      where: { tenantId, userId, type, channel }
    });
    return pref ? pref.isEnabled : true; // Default to true if not explicitly opted out
  }

  // ==============================
  // TEMPLATES (Admin Scope)
  // ==============================
  public async getTemplates(tenantId: string) {
    return prisma.notificationTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  public async getTemplateByCode(tenantId: string, code: string, channel: any) {
    return prisma.notificationTemplate.findFirst({
      where: { tenantId, code, channel, isActive: true }
    });
  }

  public async createTemplate(tenantId: string, data: any) {
    return prisma.notificationTemplate.create({
      data: { ...data, tenantId }
    });
  }

  public async updateTemplate(id: string, tenantId: string, data: any) {
    const template = await prisma.notificationTemplate.findFirst({
      where: { id, tenantId }
    });
    if (!template) throw new NotFoundError('Template not found');
    
    return prisma.notificationTemplate.update({
      where: { id },
      data
    });
  }

  public async deleteTemplate(id: string, tenantId: string) {
    const template = await prisma.notificationTemplate.findFirst({
      where: { id, tenantId }
    });
    if (!template) throw new NotFoundError('Template not found');
    
    return prisma.notificationTemplate.delete({
      where: { id }
    });
  }

  // ==============================
  // LOGS (System Scope)
  // ==============================
  public async logNotification(data: Prisma.NotificationLogUncheckedCreateInput) {
    return prisma.notificationLog.create({ data });
  }

  public async getUserForNotification(tenantId: string, userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null }
    });
  }
}

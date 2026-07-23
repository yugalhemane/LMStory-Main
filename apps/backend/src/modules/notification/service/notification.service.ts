import { NotificationRepository } from '../repository/notification.repository';
import { CreateNotificationTemplateDto, UpdateNotificationTemplateDto, UpdateNotificationPreferenceDto } from '../dto/notification.dto';
import { NotificationType, NotificationChannel, NotificationPriority } from '@prisma/client';
import { TemplateRenderer } from '../utils/template.renderer';
import { TenantEmailService } from './tenantEmail.service';
import { logger } from '../../../shared/logger';

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private tenantEmailService: TenantEmailService;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.tenantEmailService = new TenantEmailService();
  }

  // ==============================
  // NOTIFICATIONS (Learner Scope)
  // ==============================
  public async getMyNotifications(tenantId: string, userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.notificationRepository.getMyNotifications(tenantId, userId, skip, limit);
  }

  public async getNotification(id: string, tenantId: string, userId: string) {
    return this.notificationRepository.getNotification(id, tenantId, userId);
  }

  public async markAsRead(id: string, tenantId: string, userId: string) {
    return this.notificationRepository.markAsRead(id, tenantId, userId);
  }

  public async markAllAsRead(tenantId: string, userId: string) {
    return this.notificationRepository.markAllAsRead(tenantId, userId);
  }

  public async deleteNotification(id: string, tenantId: string, userId: string) {
    return this.notificationRepository.deleteNotification(id, tenantId, userId);
  }

  // ==============================
  // PREFERENCES (Learner Scope)
  // ==============================
  public async getPreferences(tenantId: string, userId: string) {
    return this.notificationRepository.getPreferences(tenantId, userId);
  }

  public async updatePreference(tenantId: string, userId: string, data: UpdateNotificationPreferenceDto) {
    return this.notificationRepository.upsertPreference(tenantId, userId, data.type, data.channel, data.isEnabled);
  }

  // ==============================
  // TEMPLATES (Admin Scope)
  // ==============================
  public async getTemplates(tenantId: string) {
    return this.notificationRepository.getTemplates(tenantId);
  }

  public async createTemplate(tenantId: string, data: CreateNotificationTemplateDto) {
    return this.notificationRepository.createTemplate(tenantId, data);
  }

  public async updateTemplate(id: string, tenantId: string, data: UpdateNotificationTemplateDto) {
    return this.notificationRepository.updateTemplate(id, tenantId, data);
  }

  public async deleteTemplate(id: string, tenantId: string) {
    return this.notificationRepository.deleteTemplate(id, tenantId);
  }

  // ==============================
  // EVENT HOOKS / DISPATCH LOGIC
  // ==============================

  /**
   * Core dispatcher. Checks preferences, renders template, and sends via appropriate channels.
   */
  private async dispatchEvent(
    tenantId: string,
    userId: string,
    code: string,
    type: NotificationType,
    priority: NotificationPriority,
    payload: Record<string, string>,
    actionUrl?: string
  ) {
    const user = await this.notificationRepository.getUserForNotification(tenantId, userId);
    if (!user) {
      logger.warn(`Notification dispatch aborted: User ${userId} not found in tenant ${tenantId}`);
      return;
    }

    const channels: NotificationChannel[] = ['IN_APP', 'EMAIL']; // Add SMS, PUSH here in future

    for (const channel of channels) {
      const isEnabled = await this.notificationRepository.isChannelEnabledForUser(tenantId, userId, type, channel);
      if (!isEnabled) continue; // User opted out

      // 1. Fetch Template (fallback to generic if missing)
      const template = await this.notificationRepository.getTemplateByCode(tenantId, code, channel);
      
      const title = template?.subject ? TemplateRenderer.render(template.subject, payload) : `Notification: ${code}`;
      const body = template?.body ? TemplateRenderer.render(template.body, payload) : `You have a new ${type} notification regarding ${code}.`;

      // 2. Dispatch
      if (channel === 'IN_APP') {
        await this.notificationRepository.createNotification({
          tenantId,
          userId,
          type,
          priority,
          title,
          body,
          actionUrl: actionUrl || null
        });
      } else if (channel === 'EMAIL' && user.email) {
        const success = await this.tenantEmailService.sendEmail(
          tenantId,
          user.email,
          title,
          body
        );
        
        await this.notificationRepository.logNotification({
          tenantId,
          userId,
          channel: 'EMAIL',
          status: success ? 'SENT' : 'FAILED',
          provider: 'MOCK_SMTP',
          subject: title,
          recipient: user.email
        });
      }
    }
  }

  // TODO: Connect BullMQ/Event Bus listeners to these methods

  public async sendEnrollmentNotification(tenantId: string, userId: string, payload: Record<string, string>) {
    await this.dispatchEvent(tenantId, userId, 'ENROLLMENT_CREATED', 'SYSTEM', 'NORMAL', payload);
  }

  public async sendCourseAssignedNotification(tenantId: string, userId: string, payload: Record<string, string>) {
    await this.dispatchEvent(tenantId, userId, 'COURSE_ASSIGNED', 'SYSTEM', 'HIGH', payload);
  }

  public async sendCampaignNotification(tenantId: string, userId: string, payload: Record<string, string>) {
    await this.dispatchEvent(tenantId, userId, 'CAMPAIGN_PUBLISHED', 'SYSTEM', 'NORMAL', payload);
  }

  public async sendCertificateIssuedNotification(tenantId: string, userId: string, payload: Record<string, string>) {
    await this.dispatchEvent(tenantId, userId, 'CERTIFICATE_ISSUED', 'MESSAGE', 'HIGH', payload);
  }

  public async sendPasswordResetNotification(tenantId: string, userId: string, payload: Record<string, string>) {
    await this.dispatchEvent(tenantId, userId, 'PASSWORD_RESET', 'ALERT', 'URGENT', payload);
  }

  public async sendReminderNotification(tenantId: string, userId: string, payload: Record<string, string>) {
    await this.dispatchEvent(tenantId, userId, 'REMINDER', 'REMINDER', 'NORMAL', payload);
  }
}

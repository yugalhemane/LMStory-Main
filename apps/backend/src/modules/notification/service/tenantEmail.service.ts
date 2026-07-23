import { EmailProvider } from '../utils/email.provider';
import { prisma } from '../../../database/prisma';
import { logger } from '../../../shared/logger';

export class TenantEmailService {
  /**
   * Fetches the tenant's custom SMTP configuration if enabled,
   * otherwise falls back to the global environment configuration.
   * Then instructs the EmailProvider to send the email.
   */
  public async sendEmail(tenantId: string, to: string, subject: string, html: string): Promise<boolean> {
    try {
      const tenantSettings = await prisma.tenantSettings.findUnique({
        where: { tenantId }
      });

      const emailSettings: any = tenantSettings?.emailSettings || {};
      let config = null;

      // Check if tenant has a custom SMTP enabled
      if (emailSettings.enabled && emailSettings.host) {
        config = {
          host: emailSettings.host,
          port: emailSettings.port,
          secure: emailSettings.secure || false,
          auth: {
            user: emailSettings.user,
            pass: emailSettings.password,
          },
          from: emailSettings.from || process.env.SMTP_FROM,
        };
      }

      // Delegate to pure EmailProvider with explicit config
      return EmailProvider.send(to, subject, html, config);
    } catch (error) {
      logger.error(`[TenantEmailService] Failed to send email for tenant ${tenantId}`, error);
      return false;
    }
  }
}

import { logger } from '../../../shared/logger';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export class EmailProvider {
  /**
   * Abstracted email sender.
   * Sends an email using the provided SMTP configuration, or falls back to Global environment configuration.
   * This is a pure provider - it knows nothing about Tenants or Users.
   */
  static async send(to: string, subject: string, _html: string, config: any = null): Promise<boolean> {
    try {
      // In a real implementation, you would initialize nodemailer here using the `config` object:
      // const transporter = nodemailer.createTransport(config || {
      //   host: process.env.SMTP_HOST,
      //   port: parseInt(process.env.SMTP_PORT || '587'),
      //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      // });
      // await transporter.sendMail({ from, to, subject, html });

      const transportHost = config ? config.host : (process.env.SMTP_HOST || 'GLOBAL_MOCK_SMTP');
      
      logger.info(`[EmailProvider] Sending Email via ${transportHost}`);
      logger.info(`[EmailProvider] To: ${to}`);
      logger.info(`[EmailProvider] Subject: ${subject}`);
      
      return true;
    } catch (error) {
      logger.error(`[EmailProvider] Failed to send email to ${to}:`, error);
      return false;
    }
  }
}

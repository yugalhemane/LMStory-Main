import nodemailer from 'nodemailer';
import { EmailProvider } from '../interfaces/email-provider.interface';


export class SmtpEmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public async sendVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@lmstory.com',
      to: email,
      subject: 'Verify your LMStory account',
      text: `Please verify your account by clicking the following link: ${verificationUrl}`,
      html: `<p>Please verify your account by clicking the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
    });
  }

  public async sendInvitation(email: string, token: string, inviterName?: string): Promise<void> {
    const inviter = inviterName ? inviterName : 'An administrator';
    const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@lmstory.com',
      to: email,
      subject: `You have been invited to LMStory by ${inviter}`,
      text: `${inviter} has invited you to join LMStory. Accept your invitation here: ${invitationUrl}`,
      html: `<p>${inviter} has invited you to join LMStory. Accept your invitation here: <a href="${invitationUrl}">${invitationUrl}</a></p>`,
    });
  }

  public async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@lmstory.com',
      to: email,
      subject: 'Reset your LMStory password',
      text: `Reset your password by clicking the following link: ${resetUrl}`,
      html: `<p>Reset your password by clicking the following link: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }
}

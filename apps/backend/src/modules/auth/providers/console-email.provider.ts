import { EmailProvider } from '../interfaces/email-provider.interface';

export class ConsoleEmailProvider implements EmailProvider {
  public async sendVerification(email: string, token: string): Promise<void> {
    console.log(`[EMAIL MOCK - VERIFICATION] To: ${email} | Token: ${token}`);
  }

  public async sendInvitation(email: string, token: string, inviterName?: string): Promise<void> {
    const inviter = inviterName ? inviterName : 'An administrator';
    console.log(`[EMAIL MOCK - INVITATION] To: ${email} | Inviter: ${inviter} | Token: ${token}`);
  }

  public async sendPasswordReset(email: string, token: string): Promise<void> {
    console.log(`[EMAIL MOCK - PASSWORD RESET] To: ${email} | Token: ${token}`);
  }
}

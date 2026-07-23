export interface EmailProvider {
  sendVerification(email: string, token: string): Promise<void>;
  sendInvitation(email: string, token: string, inviterName?: string): Promise<void>;
  sendPasswordReset(email: string, token: string): Promise<void>;
}

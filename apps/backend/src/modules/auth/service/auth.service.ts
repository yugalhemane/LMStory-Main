import bcrypt from 'bcrypt';
import { prisma } from '../../../database/prisma';
import { UnauthorizedError, ConflictError } from '../../../shared/errors';

import { VerificationService } from './verification.service';
import { InvitationService } from './invitation.service';

import { SessionService } from './session.service';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { ConsoleEmailProvider } from '../providers/console-email.provider';

export class AuthService {
  private verificationService: VerificationService;
  private invitationService: InvitationService;

  private sessionService: SessionService;
  private tenantProvisioningService: TenantProvisioningService;

  constructor() {
    // Ideally injected via DI container
    const emailProvider = new ConsoleEmailProvider(); 
    this.verificationService = new VerificationService(emailProvider);
    this.invitationService = new InvitationService(emailProvider);

    this.sessionService = new SessionService();
    this.tenantProvisioningService = new TenantProvisioningService();
  }

  public async registerTrial(data: any, ipAddress?: string, userAgent?: string) {
    const { email, password, firstName, lastName, tenantName } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictError('User with this email already exists');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Scaffold Tenant & User (via TenantProvisioning)
    const { user } = await this.tenantProvisioningService.provisionTrialTenant(
      tenantName,
      email,
      firstName,
      lastName,
      passwordHash
    );

    // 2. Issue Verification Challenge (via VerificationService)
    await this.verificationService.createChallenge(
      user.id,
      email,
      'EMAIL_LINK',
      'EMAIL_VERIFICATION',
      ipAddress,
      userAgent
    );

    return { message: 'Registration successful. Please verify your email.' };
  }

  public async resendVerification(email: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isEmailVerified) return; // Silent success

    // Ensure we don't spam. This could also check existing PENDING challenges.
    await this.verificationService.createChallenge(
      user.id,
      email,
      'EMAIL_LINK',
      'EMAIL_VERIFICATION',
      ipAddress,
      userAgent
    );

    return { message: 'Verification email resent.' };
  }

  public async verifyEmail(token: string) {
    // 1. Verify Challenge
    const userId = await this.verificationService.verifyChallenge(token, 'EMAIL_VERIFICATION');

    // 2. Activate User
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE', isEmailVerified: true },
    });

    return { message: 'Email verified successfully. You may now log in.' };
  }

  public async login(data: any, metadata: { platform?: any, browser?: any, ipAddress?: string, deviceName?: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');
    
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError(`Account is ${user.status.toLowerCase()}`);
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email first');
    }

    // Evaluate enterprise license if not Super Admin
    if (user.role !== 'SUPER_ADMIN' && user.tenantId) {
      // If hybrid system uses License, we'd check it. But wait, if SaaS, there's SubscriptionAccount.
      // Let's rely on standard tenant checks or just proceed if SaaS.
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    // 3. Issue rich Session
    const session = await this.sessionService.createSession(
      user.id,
      user.email,
      user.tenantId,
      user.role,
      metadata.platform,
      metadata.browser,
      metadata.ipAddress,
      metadata.deviceName
    );

    let redirectUrl = '/dashboard';
    if (user.role === 'SUPER_ADMIN') redirectUrl = '/super-admin';
    else if (user.role === 'TENANT_ADMIN') redirectUrl = '/admin';
    else if (user.role === 'LEARNER') redirectUrl = '/learn';

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      ...session,
      redirectUrl,
    };
  }

  public async inviteUser(data: any, inviterUserId: string, inviterName?: string) {
    return this.invitationService.inviteUser(data.email, data.role, data.tenantId, inviterUserId, inviterName);
  }

  public async acceptInvitation(token: string, data: any) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    
    const user = await this.invitationService.acceptInvitation(token, passwordHash, data.firstName, data.lastName);
    return { message: 'Invitation accepted successfully.', userId: user.id };
  }

  public async forgotPassword(email: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Silent success

    await this.verificationService.createChallenge(
      user.id,
      email,
      'EMAIL_LINK',
      'PASSWORD_RESET',
      ipAddress,
      userAgent
    );
  }

  public async resetPassword(token: string, newPassword: string) {
    const userId = await this.verificationService.verifyChallenge(token, 'PASSWORD_RESET');
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Optionally revoke all active sessions
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true, isCurrent: false, revokedAt: new Date() },
    });
  }


  public async refreshSession(refreshToken: string) {
    return this.sessionService.refreshSession(refreshToken);
  }

  public async logout(refreshToken: string) {
    return this.sessionService.revokeSession(refreshToken);
  }
}

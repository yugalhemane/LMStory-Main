import crypto from 'crypto';
import { prisma } from '../../../database/prisma';
import { EmailProvider } from '../interfaces/email-provider.interface';

export class InvitationService {
  constructor(private emailProvider: EmailProvider) {}

  public async inviteUser(
    email: string,
    role: string,
    tenantId: string,
    inviterUserId: string,
    inviterName?: string
  ) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role: role as any,
        tenantId,
        invitedByUserId: inviterUserId,
        tokenHash,
        expiresAt,
        status: 'PENDING',
      },
    });

    await this.emailProvider.sendInvitation(email, token, inviterName);

    return invitation;
  }

  public async getInvitationDetails(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invitation = await prisma.invitation.findUnique({
      where: { tokenHash },
      include: { tenant: true, inviter: true },
    });

    if (!invitation) throw new Error('Invalid invitation token');
    if (invitation.status !== 'PENDING') throw new Error('Invitation is no longer pending');
    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
      throw new Error('Invitation has expired');
    }

    return invitation;
  }

  public async acceptInvitation(token: string, passwordHash: string, firstName: string, lastName: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    return prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findUnique({ where: { tokenHash } });
      if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
        throw new Error('Invalid or expired invitation');
      }

      // Create User
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          firstName,
          lastName,
          role: invitation.role,
          tenantId: invitation.tenantId,
          status: 'ACTIVE',
          isEmailVerified: true,
        },
      });

      // Mark invitation accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });

      return user;
    });
  }
}

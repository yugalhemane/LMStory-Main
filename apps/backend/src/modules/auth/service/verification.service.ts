import crypto from 'crypto';
import { prisma } from '../../../database/prisma';
import { VerificationMethod, VerificationPurpose } from '@prisma/client';
import { EmailProvider } from '../interfaces/email-provider.interface';
import { ValidationError } from '../../../shared/errors';

export class VerificationService {
  constructor(private emailProvider: EmailProvider) {}

  public async createChallenge(
    userId: string,
    email: string,
    method: VerificationMethod,
    purpose: VerificationPurpose,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Set expiry (e.g., 2 hours)
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // Create challenge in DB
    await prisma.verificationChallenge.create({
      data: {
        userId,
        tokenHash,
        method,
        purpose,
        status: 'PENDING',
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    // Send email based on purpose
    if (purpose === 'EMAIL_VERIFICATION') {
      await this.emailProvider.sendVerification(email, token);
    } else if (purpose === 'PASSWORD_RESET') {
      await this.emailProvider.sendPasswordReset(email, token);
    }
  }

  public async verifyChallenge(token: string, purpose: VerificationPurpose): Promise<string> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const challenge = await prisma.verificationChallenge.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!challenge) {
      throw new ValidationError('Invalid verification token');
    }

    if (challenge.purpose !== purpose) {
      throw new ValidationError('Invalid token purpose');
    }

    if (challenge.status === 'VERIFIED') {
      throw new ValidationError('ALREADY_VERIFIED');
    }

    if (challenge.status !== 'PENDING') {
      throw new ValidationError('Token has already been used or cancelled');
    }

    if (challenge.expiresAt < new Date()) {
      await prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { status: 'EXPIRED' },
      });
      throw new ValidationError('Token has expired');
    }

    // Mark as verified
    await prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        consumedAt: new Date(),
      },
    });

    return challenge.userId;
  }
}

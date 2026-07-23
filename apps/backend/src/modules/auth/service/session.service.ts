import { prisma } from '../../../database/prisma';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/token.utils';
import { PlatformType, BrowserType, Role } from '@prisma/client';
import crypto from 'crypto';

export class SessionService {
  public async createSession(
    userId: string,
    email: string,
    tenantId: string | null,
    role: Role,
    platform: PlatformType = 'WEB',
    browser: BrowserType = 'OTHER',
    ipAddress?: string | null,
    deviceName?: string | null
  ) {
    const payload = { userId, email, tenantId, role, jti: crypto.randomUUID() };
    const accessToken = generateAccessToken(payload);
    const refreshTokenString = generateRefreshToken(payload);
    const refreshTokenHash = hashToken(refreshTokenString);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Optionally mark previous sessions as not current
    await prisma.refreshToken.updateMany({
      where: { userId, isCurrent: true },
      data: { isCurrent: false },
    });

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt,
        platform,
        browser,
        ipAddress: ipAddress || null,
        deviceName: deviceName || null,
        isCurrent: true,
      },
    });

    return { accessToken, refreshToken: refreshTokenString };
  }

  public async revokeSession(refreshTokenString: string) {
    if (!refreshTokenString) return;
    const tokenHash = hashToken(refreshTokenString);
    await prisma.refreshToken.update({
      where: { tokenHash },
      data: { isRevoked: true, revokedAt: new Date(), isCurrent: false },
    });
  }

  public async refreshSession(refreshTokenString: string) {
    if (!refreshTokenString) {
      throw new Error('Refresh token required');
    }

    const tokenHash = hashToken(refreshTokenString);
    const tokenRecord = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!tokenRecord || tokenRecord.isRevoked) {
      if (tokenRecord) {
        // Suspected token reuse, revoke all
        await prisma.refreshToken.updateMany({
          where: { userId: tokenRecord.userId, isRevoked: false },
          data: { isRevoked: true, revokedAt: new Date(), isCurrent: false },
        });
      }
      throw new Error('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.revokeSession(refreshTokenString);
      throw new Error('Refresh token expired');
    }

    const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } });
    if (!user || user.status !== 'ACTIVE') {
      throw new Error('User account is invalid or inactive');
    }

    // Revoke old token
    await this.revokeSession(refreshTokenString);

    // Issue new tokens (inheriting metadata from the old token)
    return this.createSession(
      user.id,
      user.email,
      user.tenantId,
      user.role,
      tokenRecord.platform || 'WEB',
      tokenRecord.browser || 'OTHER',
      tokenRecord.ipAddress || null,
      tokenRecord.deviceName || null
    );
  }
}

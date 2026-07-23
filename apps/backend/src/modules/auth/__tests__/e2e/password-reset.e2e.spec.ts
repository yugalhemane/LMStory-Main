import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../../app';
import { prisma } from '../../../../database/prisma';
import { cleanDatabase } from '../../../../__tests__/setup.e2e';
import { ConsoleEmailProvider } from '../../providers/console-email.provider';
import bcrypt from 'bcrypt';

describe('Password Reset E2E', () => {
  let emailSpy: any;
  let capturedToken: string = '';
  let userId: string = '';

  beforeAll(async () => {
    await cleanDatabase();
    emailSpy = jest.spyOn(ConsoleEmailProvider.prototype, 'sendPasswordReset').mockImplementation(async (email: string, token: string) => {
      console.log(`Email to ${email}: ${token}`);
      capturedToken = token;
    });

    const user = await prisma.user.create({
      data: {
        email: 'reset@test.com',
        firstName: 'Reset',
        lastName: 'User',
        passwordHash: await bcrypt.hash('Password123!', 10),
        role: 'LEARNER',
        isEmailVerified: true,
        status: 'ACTIVE'
      }
    });
    userId = user.id;

    // Simulate an existing session
    await request(app).post('/api/auth/login').send({ email: 'reset@test.com', password: 'Password123!' });
  });

  afterAll(() => {
    emailSpy.mockRestore();
  });

  it('1. Request password reset', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'reset@test.com' });

    expect(res.status).toBe(200);
    expect(capturedToken).not.toBe('');

    const challenge = await prisma.verificationChallenge.findFirst({ where: { userId, purpose: 'PASSWORD_RESET' } });
    expect(challenge).toBeDefined();
    expect(challenge!.status).toBe('PENDING');
  });

  it('2. Reset password using token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: capturedToken,
        newPassword: 'NewPassword123!'
      });

    expect(res.status).toBe(200);

    const challenge = await prisma.verificationChallenge.findFirst({ where: { userId, purpose: 'PASSWORD_RESET' } });
    expect(challenge!.status).toBe('VERIFIED');

    // Assertion: Check existing session is revoked
    const dbTokens = await prisma.refreshToken.findMany({ where: { userId } });
    expect(dbTokens.every(t => t.isRevoked === true)).toBe(true);
    expect(dbTokens.every(t => t.isCurrent === false)).toBe(true);
  });

  it('3. Login with new password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reset@test.com', password: 'NewPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});

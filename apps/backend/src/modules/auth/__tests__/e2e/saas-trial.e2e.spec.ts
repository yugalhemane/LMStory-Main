import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../../app'; // Assuming there is an app.ts exporting the Express app
import { prisma } from '../../../../database/prisma';
import { cleanDatabase } from '../../../../__tests__/setup.e2e';
import { ConsoleEmailProvider } from '../../providers/console-email.provider';

describe('SaaS Trial Lifecycle E2E', () => {
  let emailSpy: any;
  let capturedToken: string = '';

  beforeAll(async () => {
    await cleanDatabase();
    
    // Spy on email provider to capture the verification token
    emailSpy = jest.spyOn(ConsoleEmailProvider.prototype, 'sendVerification').mockImplementation(async (email: string, token: string) => {
      console.log(`Email to ${email}: ${token}`);
      capturedToken = token;
    });
  });

  afterAll(() => {
    emailSpy.mockRestore();
  });

  it('1. Register Trial', async () => {
    const res = await request(app)
      .post('/api/auth/register-trial')
      .send({
        tenantName: 'Acme Corp',
        email: 'admin@acme.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('Registration successful');
    expect(capturedToken).not.toBe('');

    // Database Assertions
    const tenant = await prisma.tenant.findFirst({ where: { name: 'Acme Corp' } });
    expect(tenant).toBeDefined();
    expect(tenant!.status).toBe('ACTIVE');

    const user = await prisma.user.findUnique({ where: { email: 'admin@acme.com' } });
    expect(user).toBeDefined();
    expect(user!.isEmailVerified).toBe(false);
    expect(user!.role).toBe('TENANT_ADMIN');

    const sub = await prisma.subscriptionAccount.findUnique({ where: { tenantId: tenant!.id } });
    expect(sub).toBeDefined();
    expect(sub!.status).toBe('TRIAL');

    const challenge = await prisma.verificationChallenge.findFirst({ where: { userId: user!.id } });
    if (!challenge) {
      console.log('All challenges in DB:', await prisma.verificationChallenge.findMany());
    }
    expect(challenge).not.toBeNull();
    expect(challenge!.status).toBe('PENDING');
  });

  it('2. Consume Verification Challenge', async () => {
    const res = await request(app)
      .post('/api/auth/verify')
      .send({ token: capturedToken });

    expect(res.status).toBe(200);

    // Database Assertions
    const user = await prisma.user.findUnique({ where: { email: 'admin@acme.com' } });
    expect(user!.isEmailVerified).toBe(true);

    const challenge = await prisma.verificationChallenge.findFirst({ where: { userId: user!.id } });
    expect(challenge!.status).toBe('VERIFIED');
  });

  it('3. Login with Verified Account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@acme.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.redirectUrl).toBe('/admin');
    expect(res.body.data.accessToken).toBeDefined();

    // Check cookies for refreshToken
    const cookies = (res.headers['set-cookie'] as any) || [];
    expect(cookies.some((c: string) => c.includes('refreshToken='))).toBeTruthy();

    // Database Assertions
    const tokens = await prisma.refreshToken.findMany({ where: { user: { email: 'admin@acme.com' } } });
    expect(tokens.length).toBe(1);
    expect(tokens[0]!.isCurrent).toBe(true);
    expect(tokens[0]!.isRevoked).toBe(false);
  });
});

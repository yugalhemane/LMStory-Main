import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../../app';
import { prisma } from '../../../../database/prisma';
import { cleanDatabase } from '../../../../__tests__/setup.e2e';
import { ConsoleEmailProvider } from '../../providers/console-email.provider';
import bcrypt from 'bcrypt';

describe('Invitation Lifecycle E2E', () => {
  let emailSpy: any;
  let capturedToken: string = '';
  let adminAccessToken: string = '';
  let tenantId: string = '';

  beforeAll(async () => {
    await cleanDatabase();
    emailSpy = jest.spyOn(ConsoleEmailProvider.prototype, 'sendInvitation').mockImplementation(async (email: string, token: string) => {
      console.log(`Email to ${email}: ${token}`);
      capturedToken = token;
    });

    // Seed Tenant and Admin
    const tenant = await prisma.tenant.create({ data: { name: 'Invite Corp', slug: 'invite-corp', code: 'INV123' } });
    tenantId = tenant.id;
    
    await prisma.user.create({
      data: {
        email: 'admin@invite.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: await bcrypt.hash('Password123!', 10),
        role: 'TENANT_ADMIN',
        tenantId: tenant.id,
        isEmailVerified: true,
        status: 'ACTIVE'
      }
    });

    // Login to get token
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@invite.com', password: 'Password123!' });
    adminAccessToken = res.body.data.accessToken;
  });

  afterAll(() => {
    emailSpy.mockRestore();
  });

  it('1. Invite user', async () => {
    const res = await request(app)
      .post('/api/auth/invitations')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        email: 'learner@invite.com',
        role: 'LEARNER',
        tenantId
      });

    expect(res.status).toBe(201);
    expect(capturedToken).not.toBe('');

    const invitation = await prisma.invitation.findUnique({ where: { tenantId_email: { email: 'learner@invite.com', tenantId } } });
    expect(invitation).toBeDefined();
    expect(invitation!.status).toBe('PENDING');
  });

  it('2. Accept invitation', async () => {
    const res = await request(app)
      .post('/api/auth/accept-invitation')
      .send({
        token: capturedToken,
        firstName: 'New',
        lastName: 'Learner',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { email: 'learner@invite.com' } });
    expect(user).toBeDefined();
    expect(user!.tenantId).toBe(tenantId);
    expect(user!.role).toBe('LEARNER');

    const invitation = await prisma.invitation.findFirst({ where: { email: 'learner@invite.com' } });
    expect(invitation!.status).toBe('ACCEPTED');
  });

  it('3. Learner First Login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'learner@invite.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.redirectUrl).toBe('/learn');
  });
});

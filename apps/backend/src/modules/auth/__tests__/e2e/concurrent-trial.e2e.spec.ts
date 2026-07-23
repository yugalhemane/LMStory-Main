import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../../app';
import { prisma } from '../../../../database/prisma';
import { cleanDatabase } from '../../../../__tests__/setup.e2e';
import { ConsoleEmailProvider } from '../../providers/console-email.provider';

describe('Concurrent Trial Registrations E2E', () => {
  let emailSpy: any;

  beforeAll(async () => {
    await cleanDatabase();
    emailSpy = jest.spyOn(ConsoleEmailProvider.prototype, 'sendVerification').mockImplementation(async () => {});
  });

  afterAll(() => {
    emailSpy.mockRestore();
  });

  it('1. Reject concurrent duplicate registrations safely', async () => {
    const payload = {
      tenantName: 'Race Corp',
      email: 'race@corp.com',
      firstName: 'Race',
      lastName: 'User',
      password: 'Password123!',
    };

    const responses = await Promise.all([
      request(app).post('/api/auth/register-trial').send(payload),
      request(app).post('/api/auth/register-trial').send(payload)
    ]);

    const statuses = responses.map(r => r.status);
    expect(statuses.includes(201)).toBe(true);
    expect(statuses.includes(409) || statuses.includes(400)).toBe(true);

    const users = await prisma.user.findMany({ where: { email: 'race@corp.com' } });
    expect(users.length).toBe(1);

    const tenants = await prisma.tenant.findMany({ where: { name: 'Race Corp' } });
    expect(tenants.length).toBe(1);
  });
});

import { describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../../../app';
import { prisma } from '../../../../database/prisma';
import { cleanDatabase } from '../../../../__tests__/setup.e2e';
import crypto from 'crypto';

describe('Verification Engine E2E Edge Cases', () => {
  let userId: string = '';

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    // Scaffold dummy user safely
    let user = await prisma.user.findUnique({ where: { email: 'verify@test.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'verify@test.com',
          firstName: 'Verify',
          lastName: 'User',
          passwordHash: 'dummy',
        }
      });
    }
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.verificationChallenge.deleteMany();
    await prisma.user.deleteMany({ where: { email: 'verify@test.com' } });
  });

  async function createChallenge(status: any, timeShiftHours: number = 0) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + (2 + timeShiftHours) * 60 * 60 * 1000);
    
    await prisma.verificationChallenge.create({
      data: {
        userId,
        tokenHash,
        method: 'EMAIL_LINK',
        purpose: 'EMAIL_VERIFICATION',
        status,
        expiresAt
      }
    });
    return rawToken;
  }

  it('1. Reject invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/verify')
      .send({ token: 'invalid_random_string' });
    
    expect(res.status).toBe(400); 
  });

  it('2. Reject expired token', async () => {
    const rawToken = await createChallenge('PENDING', -3); 
    
    const res = await request(app)
      .post('/api/auth/verify')
      .send({ token: rawToken });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('expired');
    
    const challenge = await prisma.verificationChallenge.findFirst({ where: { userId } });
    expect(challenge!.status).toBe('EXPIRED');
  });

  it('3. Reject already consumed token', async () => {
    const rawToken = await createChallenge('VERIFIED'); 
    
    const res = await request(app)
      .post('/api/auth/verify')
      .send({ token: rawToken });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('ALREADY_VERIFIED');
  });
});

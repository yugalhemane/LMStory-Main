import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../../../../app';
import { prisma } from '../../../../database/prisma';
import { cleanDatabase } from '../../../../__tests__/setup.e2e';
import bcrypt from 'bcrypt';

describe('Session Management E2E', () => {
  let initialRefreshToken: string = '';
  let newRefreshToken: string = '';
  let userId: string = '';

  beforeAll(async () => {
    await cleanDatabase();

    const user = await prisma.user.create({
      data: {
        email: 'session@test.com',
        firstName: 'Session',
        lastName: 'User',
        passwordHash: await bcrypt.hash('Password123!', 10),
        role: 'LEARNER',
        isEmailVerified: true,
        status: 'ACTIVE'
      }
    });
    userId = user.id;
  });

  it('1. Login and create session', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TestBrowser/1.0')
      .send({ email: 'session@test.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    const cookies = (res.headers['set-cookie'] as any) || [];
    const rtCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
    expect(rtCookie).toBeDefined();
    
    initialRefreshToken = rtCookie.split(';')[0].split('=')[1];

    const dbTokens = await prisma.refreshToken.findMany({ where: { userId } });
    expect(dbTokens.length).toBe(1);
    expect(dbTokens[0]!.isCurrent).toBe(true);
  });

  it('2. Refresh Token Rotation', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', [`refreshToken=${initialRefreshToken}`]);
    
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();

    const cookies = (res.headers['set-cookie'] as any) || [];
    const rtCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
    expect(rtCookie).toBeDefined();
    
    newRefreshToken = rtCookie.split(';')[0].split('=')[1];
    expect(newRefreshToken).not.toBe(initialRefreshToken);

    const dbTokens = await prisma.refreshToken.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    expect(dbTokens.length).toBe(2);
    
    const oldToken = dbTokens.find(t => t.isRevoked === true);
    expect(oldToken).toBeDefined();
    expect(oldToken!.isCurrent).toBe(false);

    const activeToken = dbTokens.find(t => t.isRevoked === false);
    expect(activeToken).toBeDefined();
    expect(activeToken!.isCurrent).toBe(true);
  });

  it('3. Prevent Refresh Token Reuse (Theft Detection)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', [`refreshToken=${initialRefreshToken}`]);
    
    expect(res.status).toBe(401);
    const dbTokens = await prisma.refreshToken.findMany({ where: { userId } });
    expect(dbTokens.every(t => t.isRevoked === true)).toBe(true);
    expect(dbTokens.every(t => t.isCurrent === false)).toBe(true);
  });

  it('4. Logout (After forced revocation, should still just clear cookie)', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'session@test.com', password: 'Password123!' });
    
    const activeRt = ((loginRes.headers['set-cookie'] as any) || []).find((c: string) => c.startsWith('refreshToken='));
    const rtValue = activeRt.split(';')[0].split('=')[1];

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`refreshToken=${rtValue}`]);

    expect(logoutRes.status).toBe(200);
    
    const dbTokens = await prisma.refreshToken.findMany({ where: { userId, isRevoked: false } });
    expect(dbTokens.length).toBe(0);
  });
});

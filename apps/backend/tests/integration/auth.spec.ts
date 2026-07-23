import request from 'supertest';
import express from 'express';
import { describe, it, expect } from '@jest/globals';
import { prismaMock } from '../setup';
import authRoutes from '../../src/modules/auth/routes/auth.routes';
import * as bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Module Integration', () => {
  it('should authenticate a valid user', async () => {
    // Mock user
    const mockUser = {
      id: 'mock-user-id',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User',
      status: 'ACTIVE' as any,
      tenantId: 'mock-tenant-id',
      isEmailVerified: true,
      role: 'LEARNER' as any,
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      employeeId: null,
      phone: null,
      department: null,
      designation: null,
      profileImage: null,
      lastLoginAt: null,
      joinedAt: null,
      createdBy: null,
      updatedBy: null,
      deletedAt: null,
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    prismaMock.refreshToken.create.mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should fail with invalid password', async () => {
    const mockUser = {
      id: 'mock-user-id',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User',
      status: 'ACTIVE' as any,
      tenantId: 'mock-tenant-id',
      isEmailVerified: true,
      role: 'LEARNER' as any,
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      employeeId: null,
      phone: null,
      department: null,
      designation: null,
      profileImage: null,
      lastLoginAt: null,
      joinedAt: null,
      createdBy: null,
      updatedBy: null,
      deletedAt: null,
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    // Mock failed login counter update
    prismaMock.user.update.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});

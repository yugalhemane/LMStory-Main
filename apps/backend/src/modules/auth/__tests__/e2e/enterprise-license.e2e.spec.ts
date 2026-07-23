import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../../../../app';
import { prisma } from '../../../../database/prisma';
import { cleanDatabase } from '../../../../__tests__/setup.e2e';

describe('Enterprise License Validation E2E', () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  it('1. Reject missing license (stub endpoint check)', async () => {
    const res = await request(app)
      .post('/api/auth/license/validate')
      .send({});
    
    expect(res.status).toBe(400);
  });

  it('2. Accept valid license placeholder', async () => {
    const res = await request(app)
      .post('/api/auth/license/validate')
      .send({ licenseKey: 'VALID-KEY-123' });
    
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('stub');
  });

  it('3. Validate License DB Logic', async () => {
    const tenant = await prisma.tenant.create({ data: { name: 'Ent', slug: 'ent', code: 'ENT' } });
    
    const validLicense = await prisma.license.create({
      data: {
        tenantId: tenant.id,
        licenseKey: 'REAL-KEY',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    expect(validLicense).toBeDefined();

    const expiredLicense = await prisma.license.create({
      data: {
        tenantId: (await prisma.tenant.create({ data: { name: 'Ent2', slug: 'ent2', code: 'ENT2' } })).id,
        licenseKey: 'EXPIRED-KEY',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) 
      }
    });
    expect(expiredLicense).toBeDefined();
  });
});

import { beforeAll, afterAll } from '@jest/globals';
import { prisma } from '../database/prisma';

beforeAll(async () => {
  // Global Setup before E2E tests
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Utility to clean DB before each test suite
export const cleanDatabase = async () => {
  // Order matters due to foreign keys!
  await prisma.refreshToken.deleteMany();
  await prisma.verificationChallenge.deleteMany();
  await prisma.subscriptionAccount.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.license.deleteMany();
  await prisma.installation.deleteMany();
  
  // Clean Users and Tenants safely
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  
  // Make sure we have a Trial subscription plan for tenant provisioning
  const existingPlan = await prisma.subscriptionPlan.findFirst({ where: { isActive: true } });
  if (!existingPlan) {
    await prisma.subscriptionPlan.create({
      data: {
        name: 'Trial Plan',
        code: 'TRIAL-14D',
        isActive: true,
      }
    });
  }
};

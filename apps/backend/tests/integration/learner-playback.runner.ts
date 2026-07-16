import { PrismaClient } from '@prisma/client';
import express from 'express';
import request from 'supertest';

import learnerRoutes from '../../src/modules/learner/routes/learner.routes';

const prisma = new PrismaClient();
const app = express();

import { generateAccessToken } from '../../src/modules/auth/utils/token.utils';

app.use('/api/learner', learnerRoutes);

function createMockToken(userId: string, tenantId: string, role: string) {
  const payload = { userId, tenantId, role };
  return 'Bearer ' + generateAccessToken(payload);
}

async function runTest() {
  console.log('--- STARTING LEARNER PLAYBACK AUTHORIZATION TEST ---');
  let tenantAId = '';
  let tenantBId = '';

  try {
    // 1. Setup Data
    const tenantA = await prisma.tenant.create({
      data: { name: 'PB Tenant A', slug: 'pb-ta', domain: 'pb-ta.com', code: 'PBA' },
    });
    tenantAId = tenantA.id;
    const tenantB = await prisma.tenant.create({
      data: { name: 'PB Tenant B', slug: 'pb-tb', domain: 'pb-tb.com', code: 'PBB' },
    });
    tenantBId = tenantB.id;

    const learnerA = await prisma.user.create({
      data: {
        email: `learner-a-${Date.now()}@test.com`,
        passwordHash: 'hash',
        role: 'LEARNER',
        tenantId: tenantAId,
        firstName: 'A',
        lastName: 'Learner',
      },
    });
    const learnerB = await prisma.user.create({
      data: {
        email: `learner-b-${Date.now()}@test.com`,
        passwordHash: 'hash',
        role: 'LEARNER',
        tenantId: tenantBId,
        firstName: 'B',
        lastName: 'Learner',
      },
    });
    const learnerA2 = await prisma.user.create({
      data: {
        email: `learner-a2-${Date.now()}@test.com`,
        passwordHash: 'hash',
        role: 'LEARNER',
        tenantId: tenantAId,
        firstName: 'A2',
        lastName: 'Learner',
      },
    });

    const libraryA = await prisma.tenantLibrary.create({
      data: {
        tenantId: tenantAId,
        title: 'PB Video',
        slug: 'pb-vid',
        contentType: 'VIDEO',
        difficulty: 'BEGINNER',
      },
    });

    // Create a PENDING asset and a CONFIRMED asset
    await prisma.tenantLibraryAsset.create({
      data: {
        tenantLibraryId: libraryA.id,
        name: 'pending.mp4',
        fileType: 'video/mp4',
        fileSize: 100,
        sourceType: 'UPLOADED',
        uploadStatus: 'PENDING',
        objectKey: `tenants/${tenantAId}/pending.mp4`,
      },
    });
    await prisma.tenantLibraryAsset.create({
      data: {
        tenantLibraryId: libraryA.id,
        name: 'confirmed.mp4',
        fileType: 'video/mp4',
        fileSize: 100,
        sourceType: 'UPLOADED',
        uploadStatus: 'CONFIRMED',
        objectKey: `tenants/${tenantAId}/confirmed.mp4`,
      },
    });

    const courseA = await prisma.course.create({
      data: { tenantId: tenantAId, title: 'Course A', slug: 'course-a' },
    });
    const sectionA = await prisma.courseSection.create({
      data: { courseId: courseA.id, title: 'Section 1', order: 1 },
    });
    const courseItemA = await prisma.courseItem.create({
      data: { sectionId: sectionA.id, tenantLibraryId: libraryA.id, order: 1, itemType: 'VIDEO' },
    });

    const campaignA = await prisma.campaign.create({
      data: { tenantId: tenantAId, name: 'Camp A', status: 'ACTIVE', startDate: new Date() },
    });
    const campaignCourseA = await prisma.campaignCourse.create({
      data: {
        campaignId: campaignA.id,
        courseId: courseA.id,
        courseVersion: 1,
        tenantId: tenantAId,
      },
    });

    const enrollmentA = await prisma.enrollment.create({
      data: {
        campaignId: campaignA.id,
        userId: learnerA.id,
        tenantId: tenantAId,
        status: 'IN_PROGRESS',
        code: 'ENR-123',
      },
    });
    const enrollmentCourseA = await prisma.enrollmentCourse.create({
      data: {
        enrollmentId: enrollmentA.id,
        campaignCourseId: campaignCourseA.id,
        courseId: courseA.id,
        courseVersion: 1,
        status: 'NOT_STARTED',
        progressPercentage: 0,
      },
    });
    const progressA = await prisma.enrollmentProgress.create({
      data: {
        enrollmentCourseId: enrollmentCourseA.id,
        courseItemId: courseItemA.id,
        status: 'NOT_STARTED',
      },
    });

    const tokenLearnerA = createMockToken(learnerA.id, tenantAId, 'LEARNER');
    const tokenLearnerB = createMockToken(learnerB.id, tenantBId, 'LEARNER');
    const tokenLearnerA2 = createMockToken(learnerA2.id, tenantAId, 'LEARNER'); // Same tenant, but not their enrollment

    console.log('✓ Test data setup complete');

    // TEST 1: Unauthenticated request -> Denied (401)
    const res1 = await request(app).get(`/api/learner/progress/${progressA.id}/playback`);
    if (res1.status !== 401) throw new Error(`Test 1 Failed: Expected 401, got ${res1.status}`);
    console.log('✓ TEST 1 PASS: Unauthenticated request denied');

    // TEST 2: Authenticated but unauthorized learner (Same tenant, wrong user) -> Denied (404/403)
    // The LearnerRepository throws NotFoundError, which the global error handler normally turns into 404
    // Here we just check it doesn't succeed with 200
    const res2 = await request(app)
      .get(`/api/learner/progress/${progressA.id}/playback`)
      .set('Authorization', tokenLearnerA2);
    if (res2.status === 200) throw new Error(`Test 2 Failed: Unauthorized learner allowed access`);
    console.log('✓ TEST 2 PASS: Unauthorized learner (same tenant) denied');

    // TEST 3: Learner from another tenant -> Denied
    const res3 = await request(app)
      .get(`/api/learner/progress/${progressA.id}/playback`)
      .set('Authorization', tokenLearnerB);
    if (res3.status === 200) throw new Error(`Test 3 Failed: Cross-tenant learner allowed access`);
    console.log('✓ TEST 3 PASS: Cross-tenant learner denied');

    // TEST 4: Correct learner requesting PENDING asset -> Returns url: null (as per logic)
    // We need to delete the CONFIRMED asset temporarily to test PENDING behavior
    await prisma.tenantLibraryAsset.deleteMany({
      where: { uploadStatus: 'CONFIRMED', tenantLibraryId: libraryA.id },
    });
    const res4 = await request(app)
      .get(`/api/learner/progress/${progressA.id}/playback`)
      .set('Authorization', tokenLearnerA);
    if (res4.status !== 200 || res4.body.data.url !== null)
      throw new Error(
        `Test 4 Failed: Expected url: null for PENDING asset, got ${JSON.stringify(res4.body)}`,
      );
    console.log('✓ TEST 4 PASS: PENDING/unconfirmed asset returns url: null');

    // TEST 5: Correct learner requesting CONFIRMED asset -> Succeeds with signed URL
    // Restore CONFIRMED asset
    await prisma.tenantLibraryAsset.create({
      data: {
        tenantLibraryId: libraryA.id,
        name: 'confirmed.mp4',
        fileType: 'video/mp4',
        fileSize: 100,
        sourceType: 'UPLOADED',
        uploadStatus: 'CONFIRMED',
        objectKey: `tenants/${tenantAId}/confirmed.mp4`,
      },
    });
    const res5 = await request(app)
      .get(`/api/learner/progress/${progressA.id}/playback`)
      .set('Authorization', tokenLearnerA);
    if (
      res5.status !== 200 ||
      typeof res5.body.data.url !== 'string' ||
      !res5.body.data.url.includes('localhost:9000')
    ) {
      throw new Error(`Test 5 Failed: Expected signed URL, got ${JSON.stringify(res5.body)}`);
    }
    console.log(
      '✓ TEST 5 PASS: Correct learner requesting CONFIRMED asset successfully retrieves signed URL',
    );
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    // Clean up
    if (tenantAId || tenantBId) {
      await prisma.user.deleteMany({ where: { email: { startsWith: 'learner-' } } });
      await prisma.tenant.deleteMany({
        where: { id: { in: [tenantAId, tenantBId].filter(Boolean) } },
      });
    }
    await prisma.$disconnect();
    console.log('--- LEARNER PLAYBACK AUTHORIZATION TEST COMPLETE ---');
  }
}

runTest();

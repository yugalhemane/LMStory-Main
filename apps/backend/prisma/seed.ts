import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Database ---');

  // 1. Subscription Plan
  const plan = await prisma.subscriptionPlan.upsert({
    where: { code: 'ENTERPRISE' },
    update: {},
    create: {
      name: 'Enterprise Plan',
      code: 'ENTERPRISE',
      maxUsers: 1000,
      maxStorage: 100000000,
      maxCourses: 100,
      maxCampaigns: 50,
      maxAdmins: 10
    }
  });

  // 2. Sample Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      code: 'ACME01',
      domain: 'acme.lmstory.com',
      status: 'ACTIVE',
      deploymentMode: 'SAAS',
      subscriptionAccount: {
        create: {
          subscriptionPlanId: plan.id,
          status: 'ACTIVE'
        }
      },
      settings: {
        create: {
          timezone: 'UTC',
          language: 'en'
        }
      }
    }
  });
  console.log(`✅ Tenant created: ${tenant.name}`);

  // 3. Users (Tenant Admin & Learner)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Admin',
      isEmailVerified: true,
      tenantId: tenant.id,
      department: 'IT',
      designation: 'LMS Administrator',
      role: 'TENANT_ADMIN'
    }
  });

  const learner = await prisma.user.upsert({
    where: { email: 'learner@acme.com' },
    update: {},
    create: {
      email: 'learner@acme.com',
      passwordHash,
      firstName: 'Bob',
      lastName: 'Learner',
      isEmailVerified: true,
      tenantId: tenant.id,
      department: 'Sales',
      designation: 'Sales Rep'
    }
  });
  console.log(`✅ Users created: ${admin.email}, ${learner.email}`);

  // 4. Group
  const group = await prisma.group.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'SALES_TEAM' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Sales Team',
      code: 'SALES_TEAM',
      members: {
        create: { userId: learner.id }
      }
    }
  });

  // 5. Global & Tenant Library
  const globalLibraryItem = await prisma.libraryContent.upsert({
    where: { slug: 'onboarding-basics' },
    update: {},
    create: {
      title: 'Onboarding Basics',
      slug: 'onboarding-basics',
      contentType: 'VIDEO',
      difficulty: 'BEGINNER',
      status: 'PUBLISHED'
    }
  });

  const tenantLibraryItem = await prisma.tenantLibrary.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'onboarding-basics-acme' } },
    update: {},
    create: {
      tenantId: tenant.id,
      title: 'Acme Onboarding Basics',
      slug: 'onboarding-basics-acme',
      contentType: 'VIDEO',
      difficulty: 'BEGINNER',
      status: 'PUBLISHED'
    }
  });

  // 6. Course & Sections
  const course = await prisma.course.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'acme-onboarding' } },
    update: {},
    create: {
      tenantId: tenant.id,
      title: 'Acme Employee Onboarding',
      slug: 'acme-onboarding',
      status: 'PUBLISHED',
      sections: {
        create: {
          title: 'Welcome',
          order: 1000,
          items: {
            create: {
              tenantLibraryId: tenantLibraryItem.id,
              itemType: 'VIDEO',
              order: 1000,
              isMandatory: true,
              completionCriteria: 'VIEW'
            }
          }
        }
      }
    }
  });

  // 7. Campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' }, // Dummy UUID just to trigger create if not found, since we don't have unique slug for campaigns
    update: {},
    create: {
      tenantId: tenant.id,
      name: '2026 Q3 Onboarding',
      status: 'ACTIVE',
      targetGroups: {
        create: { groupId: group.id, tenantId: tenant.id }
      },
      courses: {
        create: {
          tenantId: tenant.id,
          courseId: course.id,
          courseVersion: 1
        }
      }
    }
  });
  console.log(`✅ Course & Campaign created`);

  // 8. Enrollment
  const enrollmentCode = 'ENR-' + uuidv4().slice(0, 8).toUpperCase();
  
  // Checking if learner is already enrolled
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: { tenantId: tenant.id, userId: learner.id, campaignId: campaign.id }
  });

  if (!existingEnrollment) {
    const campaignCourse = await prisma.campaignCourse.findFirst({
      where: { campaignId: campaign.id, courseId: course.id }
    });

    if (campaignCourse) {
      await prisma.enrollment.create({
        data: {
          code: enrollmentCode,
          tenantId: tenant.id,
          userId: learner.id,
          campaignId: campaign.id,
          status: 'IN_PROGRESS',
          courses: {
            create: {
              campaignCourseId: campaignCourse.id,
              courseId: course.id,
              courseVersion: 1,
              status: 'IN_PROGRESS',
              progressPercentage: 50
            }
          }
        }
      });
      console.log(`✅ Enrollment created for ${learner.email}`);
    }
  }

  console.log('--- Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

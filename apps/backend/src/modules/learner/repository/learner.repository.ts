import { prisma } from '../../../database/prisma';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../../shared/errors';

export class LearnerRepository {
  
  public async getDashboard(tenantId: string, userId: string) {
    const baseWhere = { tenantId, userId, deletedAt: null };

    const [active, upcoming, completed, allStats] = await Promise.all([
      // Active Courses
      prisma.enrollment.findMany({
        where: { ...baseWhere, status: { in: ['IN_PROGRESS', 'NOT_STARTED'] }, campaign: { status: 'ACTIVE' } },
        include: { campaign: true, courses: { include: { campaignCourse: { include: { course: true } } } } },
        orderBy: { createdAt: 'desc' }
      }),
      // Upcoming Courses
      prisma.enrollment.findMany({
        where: { ...baseWhere, campaign: { status: 'SCHEDULED' } },
        include: { campaign: true, courses: { include: { campaignCourse: { include: { course: true } } } } },
        orderBy: { campaign: { startDate: 'asc' } }
      }),
      // Completed Courses
      prisma.enrollment.findMany({
        where: { ...baseWhere, status: 'COMPLETED' },
        include: { campaign: true, courses: { include: { campaignCourse: { include: { course: true } } } } },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      // Progress Summary
      prisma.enrollment.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true }
      })
    ]);

    // Find the single "Continue Learning" item (most recently accessed active enrollment)
    const continueLearning = await prisma.enrollmentCourse.findFirst({
      where: {
        enrollment: { ...baseWhere, status: 'IN_PROGRESS', campaign: { status: 'ACTIVE' } }
      },
      orderBy: { lastAccessedAt: 'desc' },
      include: {
        campaignCourse: { include: { course: true } },
        enrollment: { include: { campaign: true } }
      }
    });

    return {
      active,
      upcoming,
      completed,
      continueLearning,
      summary: allStats.reduce((acc, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  public async getEnrollmentDetails(enrollmentId: string, tenantId: string, userId: string) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId, userId, deletedAt: null },
      include: {
        campaign: true,
        courses: {
          include: {
            campaignCourse: {
              include: {
                course: {
                  include: {
                    sections: {
                      orderBy: { order: 'asc' },
                      include: {
                        items: {
                          orderBy: { order: 'asc' },
                          include: { tenantLibrary: true }
                        }
                      }
                    }
                  }
                }
              }
            },
            progress: {
              include: { courseItem: true }
            }
          }
        }
      }
    });
    
    if (!enrollment) throw new NotFoundError('Enrollment not found');
    return enrollment;
  }

  public async getProgressRecord(progressId: string, tenantId: string, userId: string) {
    const progress = await prisma.enrollmentProgress.findFirst({
      where: { id: progressId },
      include: {
        courseItem: {
          include: { tenantLibrary: { include: { assets: true } } }
        },
        enrollmentCourse: {
          include: {
            enrollment: true,
            progress: true,
            campaignCourse: {
              include: {
                course: {
                  include: {
                    sections: {
                      include: { items: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!progress || progress.enrollmentCourse.enrollment.tenantId !== tenantId || progress.enrollmentCourse.enrollment.userId !== userId) {
      throw new NotFoundError('Progress record not found');
    }

    return progress;
  }

  public async updateProgressAndBubble(
    userId: string,
    progressId: string,
    enrollmentCourseId: string,
    enrollmentId: string,
    progressData: Prisma.EnrollmentProgressUpdateInput,
    courseUpdateData: Prisma.EnrollmentCourseUpdateInput,
    enrollmentUpdateData: Prisma.EnrollmentUpdateInput,
    actionName: string,
    metadata: any
  ): Promise<void> {
    await prisma.$transaction([
      prisma.enrollmentProgress.update({
        where: { id: progressId },
        data: progressData
      }),
      prisma.enrollmentCourse.update({
        where: { id: enrollmentCourseId },
        data: courseUpdateData
      }),
      prisma.enrollment.update({
        where: { id: enrollmentId },
        data: enrollmentUpdateData
      }),
      prisma.enrollmentActivity.create({
        data: {
          enrollmentId,
          userId,
          action: actionName,
          metadata
        }
      })
    ]);
  }
}

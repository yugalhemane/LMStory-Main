import { prisma } from '../../../database/prisma';
import { Prisma, EnrollmentStatus, Enrollment } from '@prisma/client';
import { NotFoundError } from '../../../shared/errors';

export class EnrollmentRepository {
  public async getCampaignDetailsForEnrollment(campaignId: string, tenantId: string) {
    return prisma.campaign.findFirst({
      where: { id: campaignId, tenantId, deletedAt: null },
      include: {
        courses: {
          include: {
            course: {
              include: {
                sections: {
                  include: {
                    items: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  public async checkUserTenant(userId: string, tenantId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null }
    });
    return !!user;
  }

  public async getExistingEnrollmentIds(campaignId: string, userIds: string[], tenantId: string): Promise<string[]> {
    const existing = await prisma.enrollment.findMany({
      where: {
        campaignId,
        tenantId,
        userId: { in: userIds },
        deletedAt: null
      },
      select: { userId: true }
    });
    return existing.map(e => e.userId);
  }

  public async bulkCreateEnrollments(
    tenantId: string,
    campaignId: string,
    userIds: string[],
    campaignCourses: any[],
    createdBy: string
  ): Promise<void> {
    // Generate code suffix dynamically using UUID or short strings.
    // In production, an atomic counter is safer, but we'll use a strong random suffix for now.

    const transactionWrites: any[] = [];

    for (const userId of userIds) {
      const enrollmentCode = `ENR${Math.random().toString().substring(2, 8)}`;
      
      const enrollmentId = crypto.randomUUID();

      transactionWrites.push(
        prisma.enrollment.create({
          data: {
            id: enrollmentId,
            code: enrollmentCode,
            tenantId,
            campaignId,
            userId,
            createdBy
          }
        })
      );

      transactionWrites.push(
        prisma.enrollmentActivity.create({
          data: {
            enrollmentId,
            userId,
            action: 'ENROLLMENT_CREATED',
            metadata: { message: 'Enrolled via Campaign' }
          }
        })
      );

      for (const campaignCourse of campaignCourses) {
        const enrollmentCourseId = crypto.randomUUID();
        
        transactionWrites.push(
          prisma.enrollmentCourse.create({
            data: {
              id: enrollmentCourseId,
              enrollmentId,
              campaignCourseId: campaignCourse.id,
              courseId: campaignCourse.course.id,
              courseVersion: campaignCourse.courseVersion,
            }
          })
        );

        for (const section of campaignCourse.course.sections) {
          for (const item of section.items) {
            transactionWrites.push(
              prisma.enrollmentProgress.create({
                data: {
                  enrollmentCourseId,
                  courseItemId: item.id
                }
              })
            );
          }
        }
      }
    }

    // Execute the massive chunk transaction
    await prisma.$transaction(transactionWrites);
  }

  public async findById(id: string, tenantId: string): Promise<Enrollment | null> {
    return prisma.enrollment.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        courses: {
          include: {
            progress: true,
            campaignCourse: { include: { course: true } }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  public async searchAndPaginate(
    tenantId: string,
    params: {
      campaignId?: string;
      userId?: string;
      status?: EnrollmentStatus;
      page: number;
      limit: number;
    }
  ) {
    const where: Prisma.EnrollmentWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (params.campaignId) where.campaignId = params.campaignId;
    if (params.userId) where.userId = params.userId;
    if (params.status) where.status = params.status;

    const skip = (params.page - 1) * params.limit;
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({ 
        where, 
        skip, 
        take: params.limit, 
        orderBy: { createdAt: 'desc' },
        include: { user: true, campaign: true }
      }),
      prisma.enrollment.count({ where }),
    ]);

    return {
      data: enrollments,
      meta: { total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) },
    };
  }

  public async updateItemProgress(
    progressId: string, 
    tenantId: string, 
    userId: string,
    status: EnrollmentStatus, 
    score?: number, 
    timeSpentDelta: number = 0
  ): Promise<void> {
    const progress = await prisma.enrollmentProgress.findFirst({
      where: { id: progressId },
      include: {
        enrollmentCourse: {
          include: { enrollment: true }
        }
      }
    });

    if (!progress) throw new NotFoundError('Progress record not found');
    if (progress.enrollmentCourse.enrollment.tenantId !== tenantId) {
      throw new NotFoundError('Progress record not found');
    }

    const now = new Date();
    const data: Prisma.EnrollmentProgressUpdateInput = {
      status,
      lastAccessedAt: now,
      timeSpentSeconds: { increment: timeSpentDelta }
    };

    if (score !== undefined) data.score = score;
    if (status === 'IN_PROGRESS' && progress.status === 'NOT_STARTED') {
      data.startedAt = now;
    }
    if (status === 'COMPLETED' && progress.status !== 'COMPLETED') {
      data.completedAt = now;
    }

    await prisma.$transaction([
      prisma.enrollmentProgress.update({
        where: { id: progressId },
        data
      }),
      prisma.enrollmentActivity.create({
        data: {
          enrollmentId: progress.enrollmentCourse.enrollmentId,
          userId,
          action: `LESSON_${status}`,
          metadata: { progressId, score, timeSpentDelta }
        }
      })
    ]);
  }

  public async softDelete(id: string, tenantId: string, archivedBy: string): Promise<Enrollment> {
    const existing = await prisma.enrollment.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Enrollment not found');
    return prisma.enrollment.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: archivedBy },
    });
  }
}

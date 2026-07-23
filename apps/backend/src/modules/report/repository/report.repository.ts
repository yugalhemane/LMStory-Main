import { prisma } from '../../../database/prisma';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../../shared/errors';

export class ReportRepository {
  
  public async getDashboardSummary(tenantId: string) {
    const baseWhere = { tenantId, deletedAt: null };
    const [
      totalUsers,
      activeUsers,
      totalGroups,
      totalCourses,
      publishedCourses,
      totalCampaigns,
      activeCampaigns,
      totalEnrollments,
      completedEnrollments,
      certificatesIssued,
      progressAggregate
    ] = await Promise.all([
      prisma.user.count({ where: baseWhere }),
      prisma.user.count({ where: { ...baseWhere, isActive: true, status: 'ACTIVE' } }),
      prisma.group.count({ where: baseWhere }),
      prisma.course.count({ where: baseWhere }),
      prisma.course.count({ where: { ...baseWhere, status: 'PUBLISHED' } }),
      prisma.campaign.count({ where: baseWhere }),
      prisma.campaign.count({ where: { ...baseWhere, status: 'ACTIVE' } }),
      prisma.enrollment.count({ where: baseWhere }),
      prisma.enrollment.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
      prisma.enrollmentCertificate.count({ where: { tenantId, status: 'ISSUED', deletedAt: null } }),
      prisma.enrollmentCourse.aggregate({
        where: { enrollment: baseWhere },
        _avg: { progressPercentage: true }
      })
    ]);

    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    const averageProgress = progressAggregate._avg.progressPercentage || 0;

    return {
      totalUsers, activeUsers, totalGroups, totalCourses, publishedCourses,
      totalCampaigns, activeCampaigns, totalEnrollments, completedEnrollments,
      certificatesIssued, completionRate, averageProgress
    };
  }

  public async getUsersReport(tenantId: string, filter: Prisma.UserWhereInput, skip: number, take: number, orderBy: any) {
    const where = { ...filter, tenantId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take, orderBy,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          department: true, designation: true, status: true, joinedAt: true, isActive: true,
          _count: {
            select: { enrollments: true, certificates: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    return { data, total };
  }

  public async getCoursesReport(tenantId: string) {
    const courses = await prisma.course.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true, title: true, status: true,
        campaignCourses: {
          select: {
            _count: { select: { enrollmentCourses: true } },
            enrollmentCourses: {
              select: {
                status: true, progressPercentage: true, timeSpentSeconds: true,
                progress: {
                  select: { score: true }
                }
              }
            }
          }
        }
      }
    });

    return courses.map(course => {
      let enrollmentCount = 0;
      let completionCount = 0;
      let totalProgress = 0;
      let totalTime = 0;
      let totalScore = 0;
      let scoreCount = 0;

      course.campaignCourses.forEach(cc => {
        enrollmentCount += cc._count.enrollmentCourses;
        cc.enrollmentCourses.forEach(ec => {
          if (ec.status === 'COMPLETED') completionCount++;
          totalProgress += ec.progressPercentage;
          totalTime += ec.timeSpentSeconds;
          ec.progress.forEach(p => {
            if (p.score !== null) {
              totalScore += p.score;
              scoreCount++;
            }
          });
        });
      });

      return {
        id: course.id,
        title: course.title,
        status: course.status,
        enrollmentCount,
        completionCount,
        completionRate: enrollmentCount > 0 ? (completionCount / enrollmentCount) * 100 : 0,
        averageProgress: enrollmentCount > 0 ? (totalProgress / enrollmentCount) : 0,
        averageTimeSpent: enrollmentCount > 0 ? (totalTime / enrollmentCount) : 0,
        averageScore: scoreCount > 0 ? (totalScore / scoreCount) : 0
      };
    });
  }

  public async getCampaignsReport(tenantId: string) {
    return prisma.campaign.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true, name: true, status: true, startDate: true, endDate: true,
        _count: {
          select: { targetUsers: true, enrollments: true }
        },
        enrollments: {
          select: { status: true }
        }
      }
    }).then(campaigns => campaigns.map(c => {
      const activeLearners = c.enrollments.filter(e => e.status === 'IN_PROGRESS').length;
      const completedLearners = c.enrollments.filter(e => e.status === 'COMPLETED').length;
      const enrolled = c._count.enrollments;
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        assignedUsers: c._count.targetUsers,
        enrolledUsers: enrolled,
        activeLearners,
        completedLearners,
        completionPercentage: enrolled > 0 ? (completedLearners / enrolled) * 100 : 0
      };
    }));
  }

  public async getGroupsReport(tenantId: string) {
    return prisma.group.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true, name: true, type: true,
        _count: { select: { members: true, campaignTargets: true } }
      }
    });
  }

  public async getLearnerReport(userId: string, tenantId: string) {
    // 1. Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true, department: true }
    });
    if (!user) throw new NotFoundError('Learner not found in this tenant.');

    const [enrollments, certificates, activities] = await Promise.all([
      prisma.enrollmentCourse.findMany({
        where: { enrollment: { userId, tenantId, deletedAt: null } },
        select: {
          status: true, progressPercentage: true, timeSpentSeconds: true,
          campaignCourse: { select: { course: { select: { title: true } } } },
          progress: { select: { score: true } }
        }
      }),
      prisma.enrollmentCertificate.findMany({
        where: { userId, tenantId, deletedAt: null },
        select: { certificateCode: true, issuedAt: true, status: true, course: { select: { title: true } } }
      }),
      prisma.enrollmentActivity.findMany({
        where: { userId, enrollment: { tenantId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { action: true, createdAt: true, metadata: true }
      })
    ]);

    let totalScore = 0;
    let scoreCount = 0;
    let totalTime = 0;
    let totalProgress = 0;

    enrollments.forEach(e => {
      totalTime += e.timeSpentSeconds;
      totalProgress += e.progressPercentage;
      e.progress.forEach(p => {
        if (p.score !== null) {
          totalScore += p.score;
          scoreCount++;
        }
      });
    });

    return {
      learner: user,
      assignedCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'COMPLETED').length,
      activeCourses: enrollments.filter(e => e.status === 'IN_PROGRESS').length,
      certificates,
      averageScore: scoreCount > 0 ? (totalScore / scoreCount) : 0,
      averageProgress: enrollments.length > 0 ? (totalProgress / enrollments.length) : 0,
      totalLearningTimeSeconds: totalTime,
      recentActivities: activities
    };
  }

  public async getCertificatesReport(tenantId: string, filter: Prisma.EnrollmentCertificateWhereInput, skip: number, take: number) {
    const where = { ...filter, tenantId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.enrollmentCertificate.findMany({
        where, skip, take, orderBy: { issuedAt: 'desc' },
        select: {
          id: true, certificateCode: true, status: true, issuedAt: true, revocationReason: true,
          user: { select: { firstName: true, lastName: true, email: true } },
          course: { select: { title: true } }
        }
      }),
      prisma.enrollmentCertificate.count({ where })
    ]);
    return { data, total };
  }
}

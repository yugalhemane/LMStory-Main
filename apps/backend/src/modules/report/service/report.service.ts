import { ReportRepository } from '../repository/report.repository';
import { UserReportQueryDto, CertificateReportQueryDto } from '../dto/report.dto';
import { Prisma } from '@prisma/client';
import { logger } from '../../../shared/logger';

export class ReportService {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  public async getDashboardSummary(tenantId: string) {
    logger.info(`Dashboard Summary generated for tenant: ${tenantId}`);
    return this.reportRepository.getDashboardSummary(tenantId);
  }

  public async getUsersReport(tenantId: string, query: UserReportQueryDto) {
    const filter: Prisma.UserWhereInput = {};
    if (query.search) {
      filter.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    if (query.department) filter.department = query.department;
    if (query.designation) filter.designation = query.designation;
    if (query.status) filter.status = query.status;
    if (query.joinedAfter || query.joinedBefore) {
      filter.joinedAt = {};
      if (query.joinedAfter) filter.joinedAt.gte = new Date(query.joinedAfter);
      if (query.joinedBefore) filter.joinedAt.lte = new Date(query.joinedBefore);
    }

    const skip = (query.page - 1) * query.limit;
    const orderBy = query.sortBy ? { [query.sortBy]: query.sortOrder } : { createdAt: 'desc' };

    return this.reportRepository.getUsersReport(tenantId, filter, skip, query.limit, orderBy);
  }

  public async getCoursesReport(tenantId: string) {
    return this.reportRepository.getCoursesReport(tenantId);
  }

  public async getCampaignsReport(tenantId: string) {
    return this.reportRepository.getCampaignsReport(tenantId);
  }

  public async getGroupsReport(tenantId: string) {
    return this.reportRepository.getGroupsReport(tenantId);
  }

  public async getLearnerReport(userId: string, tenantId: string) {
    logger.info(`Learner Report generated for user: ${userId}, tenant: ${tenantId}`);
    return this.reportRepository.getLearnerReport(userId, tenantId);
  }

  public async getCertificatesReport(tenantId: string, query: CertificateReportQueryDto) {
    const filter: Prisma.EnrollmentCertificateWhereInput = {};
    if (query.status) filter.status = query.status;
    if (query.courseId) filter.courseId = query.courseId;
    if (query.learnerId) filter.userId = query.learnerId;
    // Campaign ID filter is complex because it's not direct on Certificate. It's Certificate -> Enrollment -> Campaign.
    if (query.campaignId) {
      filter.enrollment = { campaignId: query.campaignId };
    }
    if (query.issuedAfter || query.issuedBefore) {
      filter.issuedAt = {};
      if (query.issuedAfter) filter.issuedAt.gte = new Date(query.issuedAfter);
      if (query.issuedBefore) filter.issuedAt.lte = new Date(query.issuedBefore);
    }

    const skip = (query.page - 1) * query.limit;

    return this.reportRepository.getCertificatesReport(tenantId, filter, skip, query.limit);
  }
}

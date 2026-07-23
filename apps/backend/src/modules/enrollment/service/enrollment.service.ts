import { EnrollmentRepository } from '../repository/enrollment.repository';
import { BulkEnrollmentDto, ListEnrollmentsDto, UpdateProgressDto } from '../dto/enrollment.dto';
import { logger } from '../../../shared/logger';
import { ValidationError } from '../../../shared/errors';

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;

  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
  }

  public async bulkEnroll(tenantId: string, data: BulkEnrollmentDto, currentUserId: string) {
    // 1. Validate Campaign
    const campaign = await this.enrollmentRepository.getCampaignDetailsForEnrollment(data.campaignId, tenantId);
    if (!campaign) {
      throw new ValidationError('Campaign not found or does not belong to your tenant');
    }

    if (campaign.status !== 'ACTIVE' && campaign.status !== 'SCHEDULED') {
      throw new ValidationError('Enrollments can only be created for ACTIVE or SCHEDULED campaigns');
    }

    if (campaign.courses.length === 0) {
      throw new ValidationError('Campaign must have at least one course attached');
    }

    // 2. Cross-Tenant User Check & Duplicate Check
    const validUserIds: string[] = [];
    const invalidUserIds: string[] = [];
    const existingUserIds = await this.enrollmentRepository.getExistingEnrollmentIds(campaign.id, data.userIds, tenantId);
    
    for (const userId of data.userIds) {
      const isSameTenant = await this.enrollmentRepository.checkUserTenant(userId, tenantId);
      if (!isSameTenant) {
        invalidUserIds.push(userId);
      } else if (!existingUserIds.includes(userId)) {
        // Only enroll if they belong to the tenant and aren't already enrolled
        validUserIds.push(userId);
      }
    }

    if (invalidUserIds.length > 0) {
      throw new ValidationError(`The following users do not belong to this tenant and cannot be enrolled: ${invalidUserIds.join(', ')}`);
    }

    if (validUserIds.length === 0) {
      return { message: 'All provided valid users are already enrolled' };
    }

    // 3. Process in Chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < validUserIds.length; i += chunkSize) {
      const chunk = validUserIds.slice(i, i + chunkSize);
      await this.enrollmentRepository.bulkCreateEnrollments(
        tenantId,
        campaign.id,
        chunk,
        campaign.courses,
        currentUserId
      );
      logger.info(`Processed enrollment chunk: ${chunk.length} users for Campaign ${campaign.id}`);
    }

    return { message: `Successfully enrolled ${validUserIds.length} users` };
  }

  public async getEnrollment(id: string, tenantId: string) {
    const enrollment = await this.enrollmentRepository.findById(id, tenantId);
    if (!enrollment) throw new Error('Not Found');
    return enrollment;
  }

  public async listEnrollments(tenantId: string, query: ListEnrollmentsDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const params: any = { page, limit };
    if (filters.campaignId !== undefined) params.campaignId = filters.campaignId;
    if (filters.userId !== undefined) params.userId = filters.userId;
    if (filters.status !== undefined) params.status = filters.status;
    return this.enrollmentRepository.searchAndPaginate(tenantId, params);
  }

  public async updateItemProgress(progressId: string, tenantId: string, currentUserId: string, data: UpdateProgressDto) {
    await this.enrollmentRepository.updateItemProgress(
      progressId,
      tenantId,
      currentUserId,
      data.status,
      data.score,
      data.timeSpentSeconds || 0
    );
    logger.info(`Updated progress ${progressId} by User ${currentUserId}`);
    return { success: true };
  }

  public async deleteEnrollment(id: string, tenantId: string, currentUserId: string) {
    await this.enrollmentRepository.softDelete(id, tenantId, currentUserId);
    logger.info(`Enrollment Deleted: ${id} in Tenant ${tenantId}`);
  }
}

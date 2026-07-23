import { CampaignRepository } from '../repository/campaign.repository';
import { CreateCampaignDto, UpdateCampaignDto, ListCampaignsDto } from '../dto/campaign.dto';
import { logger } from '../../../shared/logger';
import { ConflictError } from '../../../shared/errors';

export class CampaignService {
  private campaignRepository: CampaignRepository;

  constructor() {
    this.campaignRepository = new CampaignRepository();
  }

  public async createCampaign(tenantId: string, data: CreateCampaignDto, currentUserId: string) {
    // Duplicate Name Validation (ignoring deleted records)
    const existing = await this.campaignRepository.findByName(data.name, tenantId);
    if (existing) {
      throw new ConflictError('A campaign with this name already exists');
    }

    const campaign = await this.campaignRepository.create(tenantId, {
      ...data,
      description: data.description || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      enrollmentWindowStart: data.enrollmentWindowStart ? new Date(data.enrollmentWindowStart) : null,
      enrollmentWindowEnd: data.enrollmentWindowEnd ? new Date(data.enrollmentWindowEnd) : null,
      createdBy: currentUserId,
    });
    logger.info(`Campaign Created: ${campaign.id} in Tenant ${tenantId}`);
    return campaign;
  }

  public async getCampaign(id: string, tenantId: string) {
    const campaign = await this.campaignRepository.findById(id, tenantId);
    if (!campaign) throw new Error('Not Found'); 
    return campaign;
  }

  public async listCampaigns(tenantId: string, query: ListCampaignsDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const params: any = { page, limit };
    if (filters.search !== undefined) params.search = filters.search;
    if (filters.status !== undefined) params.status = filters.status;
    return this.campaignRepository.searchAndPaginate(tenantId, params);
  }

  public async updateCampaign(id: string, tenantId: string, data: UpdateCampaignDto, currentUserId: string) {
    if (data.name) {
      const existing = await this.campaignRepository.findByName(data.name, tenantId);
      if (existing && existing.id !== id) {
        throw new ConflictError('A campaign with this name already exists');
      }
    }

    const updateData: any = { updatedBy: currentUserId };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.enrollmentWindowStart !== undefined) updateData.enrollmentWindowStart = data.enrollmentWindowStart ? new Date(data.enrollmentWindowStart) : null;
    if (data.enrollmentWindowEnd !== undefined) updateData.enrollmentWindowEnd = data.enrollmentWindowEnd ? new Date(data.enrollmentWindowEnd) : null;
    
    // Additional service-level date validations could run here based on merged data,
    // but the schema validates the request body internally.
    // If the database has conflicting old data vs new data, it might bypass Zod,
    // but for now we assume Zod handles full updates or valid partials.

    const updated = await this.campaignRepository.update(id, tenantId, updateData);
    logger.info(`Campaign Updated: ${id} in Tenant ${tenantId}`);
    return updated;
  }

  public async deleteCampaign(id: string, tenantId: string, currentUserId: string) {
    await this.campaignRepository.softDelete(id, tenantId, currentUserId);
    logger.info(`Campaign Deleted: ${id} in Tenant ${tenantId}`);
  }

  public async restoreCampaign(id: string, tenantId: string, currentUserId: string) {
    return this.campaignRepository.restore(id, tenantId, currentUserId);
  }

  public async publishCampaign(id: string, tenantId: string, currentUserId: string) {
    const published = await this.campaignRepository.publish(id, tenantId, currentUserId);
    logger.info(`Campaign Published: ${id} in Tenant ${tenantId} as ${published.status}`);
    return published;
  }

  public async pauseCampaign(id: string, tenantId: string) {
    const paused = await this.campaignRepository.pause(id, tenantId);
    logger.info(`Campaign Paused: ${id} in Tenant ${tenantId}`);
    return paused;
  }

  // --- ATTACHMENTS ---
  public async attachCourse(campaignId: string, courseId: string, tenantId: string) {
    await this.campaignRepository.attachCourse(campaignId, courseId, tenantId);
    logger.info(`Course Attached: ${courseId} to Campaign ${campaignId} in Tenant ${tenantId}`);
  }

  public async removeCourse(campaignId: string, courseId: string, tenantId: string) {
    await this.campaignRepository.removeCourse(campaignId, courseId, tenantId);
    logger.info(`Course Removed: ${courseId} from Campaign ${campaignId} in Tenant ${tenantId}`);
  }

  public async assignGroup(campaignId: string, groupId: string, tenantId: string) {
    await this.campaignRepository.assignGroup(campaignId, groupId, tenantId);
    logger.info(`Group Assigned: ${groupId} to Campaign ${campaignId} in Tenant ${tenantId}`);
  }

  public async unassignGroup(campaignId: string, groupId: string, tenantId: string) {
    await this.campaignRepository.unassignGroup(campaignId, groupId, tenantId);
    logger.info(`Group Unassigned: ${groupId} from Campaign ${campaignId} in Tenant ${tenantId}`);
  }

  public async assignUser(campaignId: string, userId: string, tenantId: string) {
    await this.campaignRepository.assignUser(campaignId, userId, tenantId);
    logger.info(`User Assigned: ${userId} to Campaign ${campaignId} in Tenant ${tenantId}`);
  }

  public async unassignUser(campaignId: string, userId: string, tenantId: string) {
    await this.campaignRepository.unassignUser(campaignId, userId, tenantId);
    logger.info(`User Unassigned: ${userId} from Campaign ${campaignId} in Tenant ${tenantId}`);
  }
}

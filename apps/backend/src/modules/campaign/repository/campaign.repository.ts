import { prisma } from '../../../database/prisma';
import { Prisma, Campaign, CampaignStatus } from '@prisma/client';
import { NotFoundError, ValidationError, ConflictError } from '../../../shared/errors';

export class CampaignRepository {
  public async create(tenantId: string, data: Omit<Prisma.CampaignUncheckedCreateInput, 'tenantId'>): Promise<Campaign> {
    const createData = { ...data, tenantId };
    return prisma.campaign.create({ data: createData as Prisma.CampaignUncheckedCreateInput });
  }

  public async findById(id: string, tenantId: string): Promise<Campaign | null> {
    return prisma.campaign.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        courses: { include: { course: true } },
        targetGroups: { include: { group: true } },
        targetUsers: { include: { user: true } },
      }
    });
  }

  public async findByName(name: string, tenantId: string): Promise<Campaign | null> {
    return prisma.campaign.findFirst({
      where: { name, tenantId, deletedAt: null }
    });
  }

  public async update(id: string, tenantId: string, data: Prisma.CampaignUpdateInput): Promise<Campaign> {
    const existing = await prisma.campaign.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new NotFoundError('Campaign not found');
    return prisma.campaign.update({ where: { id }, data });
  }

  public async searchAndPaginate(
    tenantId: string,
    params: {
      search?: string;
      status?: CampaignStatus;
      page: number;
      limit: number;
    }
  ) {
    const where: Prisma.CampaignWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.status) where.status = params.status;

    const skip = (params.page - 1) * params.limit;
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({ where, skip, take: params.limit, orderBy: { createdAt: 'desc' } }),
      prisma.campaign.count({ where }),
    ]);

    return {
      data: campaigns,
      meta: { total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) },
    };
  }

  public async softDelete(id: string, tenantId: string, archivedBy: string): Promise<Campaign> {
    const existing = await prisma.campaign.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Campaign not found');
    return prisma.campaign.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED', archivedBy },
    });
  }

  public async restore(id: string, tenantId: string, updatedBy: string): Promise<Campaign> {
    const existing = await prisma.campaign.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Campaign not found');
    return prisma.campaign.update({
      where: { id },
      data: { deletedAt: null, status: 'DRAFT', updatedBy },
    });
  }

  // --- ATTACHMENTS (COURSES, GROUPS, USERS) ---

  public async attachCourse(campaignId: string, courseId: string, tenantId: string): Promise<void> {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, tenantId, deletedAt: null } });
    if (!campaign) throw new NotFoundError('Campaign not found');

    const course = await prisma.course.findFirst({ where: { id: courseId, tenantId, deletedAt: null } });
    if (!course) throw new NotFoundError('Course not found');
    
    if (course.status !== 'PUBLISHED') {
      throw new ValidationError('Only PUBLISHED courses can be attached to a campaign');
    }

    const existingLink = await prisma.campaignCourse.findUnique({
      where: { campaignId_courseId: { campaignId, courseId } }
    });

    if (existingLink) {
      throw new ConflictError('Course is already attached to this campaign');
    }

    await prisma.$transaction([
      prisma.campaignCourse.create({
        data: {
          tenantId,
          campaignId,
          courseId,
          courseVersion: course.version,
        }
      })
    ]);
  }

  public async removeCourse(campaignId: string, courseId: string, tenantId: string): Promise<void> {
    const link = await prisma.campaignCourse.findFirst({ where: { campaignId, courseId, tenantId } });
    if (!link) throw new NotFoundError('Course not attached to this campaign');

    await prisma.$transaction([
      prisma.campaignCourse.delete({ where: { id: link.id } })
    ]);
  }

  public async assignGroup(campaignId: string, groupId: string, tenantId: string): Promise<void> {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, tenantId, deletedAt: null } });
    if (!campaign) throw new NotFoundError('Campaign not found');

    const group = await prisma.group.findFirst({ where: { id: groupId, tenantId, deletedAt: null } });
    if (!group) throw new NotFoundError('Group not found');

    const existingLink = await prisma.campaignTargetGroup.findUnique({
      where: { campaignId_groupId: { campaignId, groupId } }
    });

    if (existingLink) throw new ConflictError('Group already assigned');

    await prisma.$transaction([
      prisma.campaignTargetGroup.create({
        data: { tenantId, campaignId, groupId }
      })
    ]);
  }

  public async unassignGroup(campaignId: string, groupId: string, tenantId: string): Promise<void> {
    const link = await prisma.campaignTargetGroup.findFirst({ where: { campaignId, groupId, tenantId } });
    if (!link) throw new NotFoundError('Group not attached to this campaign');

    await prisma.$transaction([
      prisma.campaignTargetGroup.delete({ where: { id: link.id } })
    ]);
  }

  public async assignUser(campaignId: string, userId: string, tenantId: string): Promise<void> {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, tenantId, deletedAt: null } });
    if (!campaign) throw new NotFoundError('Campaign not found');

    const user = await prisma.user.findFirst({ where: { id: userId, tenantId, deletedAt: null } });
    if (!user) throw new NotFoundError('User not found');

    const existingLink = await prisma.campaignTargetUser.findUnique({
      where: { campaignId_userId: { campaignId, userId } }
    });

    if (existingLink) throw new ConflictError('User already assigned');

    await prisma.$transaction([
      prisma.campaignTargetUser.create({
        data: { tenantId, campaignId, userId }
      })
    ]);
  }

  public async unassignUser(campaignId: string, userId: string, tenantId: string): Promise<void> {
    const link = await prisma.campaignTargetUser.findFirst({ where: { campaignId, userId, tenantId } });
    if (!link) throw new NotFoundError('User not attached to this campaign');

    await prisma.$transaction([
      prisma.campaignTargetUser.delete({ where: { id: link.id } })
    ]);
  }

  // --- TRANSITIONS ---
  public async publish(campaignId: string, tenantId: string, publishedBy: string): Promise<Campaign> {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, tenantId, deletedAt: null },
      include: {
        courses: true,
        targetGroups: true,
        targetUsers: true,
      }
    });
    if (!campaign) throw new NotFoundError('Campaign not found');

    if (campaign.courses.length === 0) {
      throw new ValidationError('Campaign must have at least one course attached');
    }
    
    if (campaign.targetGroups.length === 0 && campaign.targetUsers.length === 0) {
      throw new ValidationError('Campaign must have at least one target assigned');
    }

    if (!campaign.startDate || !campaign.endDate) {
      throw new ValidationError('Campaign scheduling dates must be set before publishing');
    }

    // Usually transitioning to SCHEDULED or ACTIVE based on current date
    const now = new Date();
    const status = now < new Date(campaign.startDate) ? 'SCHEDULED' : 'ACTIVE';

    return prisma.campaign.update({
      where: { id: campaignId },
      data: { status, publishedBy },
    });
  }

  public async pause(campaignId: string, tenantId: string): Promise<Campaign> {
    const campaign = await this.findById(campaignId, tenantId);
    if (!campaign) throw new NotFoundError('Campaign not found');
    if (campaign.status === 'ARCHIVED' || campaign.status === 'COMPLETED') {
      throw new ValidationError('Cannot pause a completed or archived campaign');
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PAUSED' },
    });
  }
}

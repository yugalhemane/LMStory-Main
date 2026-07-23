import { GroupRepository } from '../repository/group.repository';
import { CreateGroupDto, UpdateGroupDto, ListGroupsDto } from '../dto/group.dto';
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import { Prisma } from '@prisma/client';

export class GroupService {
  private groupRepository: GroupRepository;

  constructor() {
    this.groupRepository = new GroupRepository();
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
  }

  public async createGroup(tenantId: string, data: CreateGroupDto, currentUserId: string) {
    if (!tenantId) throw new ValidationError('Tenant context is required');

    const normalizedCode = this.normalizeCode(data.code);

    const existingCode = await this.groupRepository.findByCode(normalizedCode, tenantId);
    if (existingCode) {
      throw new ConflictError('Group code is already in use within this tenant');
    }

    const createInput: Prisma.GroupUncheckedCreateInput = {
      tenantId,
      name: data.name.trim(),
      code: normalizedCode,
      description: data.description?.trim() || null,
      color: data.color || null,
      type: data.type,
      createdBy: currentUserId,
    };

    const group = await this.groupRepository.create(tenantId, createInput);
    logger.info(`Group Created: ${group.id} in Tenant ${tenantId}`);
    return group;
  }

  public async getGroup(id: string, tenantId: string) {
    const group = await this.groupRepository.findById(id, tenantId);
    if (!group) throw new NotFoundError('Group not found');
    return group;
  }

  public async listGroups(tenantId: string, query: ListGroupsDto) {
    const { page = 1, limit = 10, search, type, isActive } = query;
    const params: any = { page, limit };
    
    if (search !== undefined) params.search = search;
    if (type !== undefined) params.type = type;
    if (isActive !== undefined) params.isActive = isActive;

    return this.groupRepository.searchAndPaginate(tenantId, params);
  }

  public async updateGroup(id: string, tenantId: string, data: UpdateGroupDto, currentUserId: string) {
    // The repository update logic already checks if group exists for this tenant
    const updateData: Prisma.GroupUpdateInput = {
      updatedBy: currentUserId,
    };
    
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await this.groupRepository.update(id, tenantId, updateData);
    logger.info(`Group Updated: ${updated.id} in Tenant ${tenantId}`);
    return updated;
  }

  public async softDeleteGroup(id: string, tenantId: string, currentUserId: string) {
    await this.groupRepository.softDelete(id, tenantId, currentUserId);
    logger.info(`Group Deleted (Soft): ${id} in Tenant ${tenantId}`);
  }

  public async restoreGroup(id: string, tenantId: string, currentUserId: string) {
    const group = await this.groupRepository.findByIdWithDeleted(id, tenantId);
    if (!group) throw new NotFoundError('Group not found');
    
    if (!group.deletedAt) throw new ValidationError('Group is not deleted');

    // Make sure code isn't taken by an active group
    const existingCode = await this.groupRepository.findByCode(group.code, tenantId);
    if (existingCode && existingCode.id !== group.id) {
      throw new ConflictError('Cannot restore: Group code is currently in use by another active group.');
    }

    const restored = await this.groupRepository.restore(id, tenantId, currentUserId);
    logger.info(`Group Restored: ${id} in Tenant ${tenantId}`);
    return restored;
  }

  // --- Group Members ---

  public async addMember(groupId: string, tenantId: string, userId: string) {
    await this.groupRepository.addMember(groupId, tenantId, userId);
    logger.info(`Member ${userId} Added to Group ${groupId} in Tenant ${tenantId}`);
  }

  public async removeMember(groupId: string, tenantId: string, userId: string) {
    await this.groupRepository.removeMember(groupId, tenantId, userId);
    logger.info(`Member ${userId} Removed from Group ${groupId} in Tenant ${tenantId}`);
  }

  public async listMembers(groupId: string, tenantId: string, query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    return this.groupRepository.listMembers(groupId, tenantId, { page, limit });
  }
}

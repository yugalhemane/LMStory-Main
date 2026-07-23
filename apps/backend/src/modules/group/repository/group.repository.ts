import { prisma } from '../../../database/prisma';
import { Prisma, Group } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../../shared/errors';

export class GroupRepository {
  public async create(tenantId: string, data: Prisma.GroupUncheckedCreateInput): Promise<Group> {
    data.tenantId = tenantId;
    return prisma.group.create({ data });
  }

  public async findById(id: string, tenantId: string): Promise<Group | null> {
    return prisma.group.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  public async findByIdWithDeleted(id: string, tenantId: string): Promise<Group | null> {
    return prisma.group.findFirst({
      where: { id, tenantId },
    });
  }

  public async findByCode(code: string, tenantId: string): Promise<Group | null> {
    return prisma.group.findFirst({
      where: { code, tenantId, deletedAt: null },
    });
  }

  public async update(id: string, tenantId: string, data: Prisma.GroupUpdateInput): Promise<Group> {
    // Because Prisma's update requires a unique where, we must ensure the group exists for the tenant first
    const group = await prisma.group.findFirst({ where: { id, tenantId } });
    if (!group) throw new NotFoundError('Group not found');

    return prisma.group.update({
      where: { id },
      data,
    });
  }

  public async searchAndPaginate(
    tenantId: string,
    params: {
      search?: string;
      type?: 'STATIC' | 'DYNAMIC' | 'SYSTEM';
      isActive?: boolean;
      page: number;
      limit: number;
    }
  ) {
    const where: Prisma.GroupWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { code: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.type) where.type = params.type;
    if (params.isActive !== undefined) where.isActive = params.isActive;

    const skip = (params.page - 1) * params.limit;

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.group.count({ where }),
    ]);

    return {
      data: groups,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  public async softDelete(id: string, tenantId: string, updatedBy: string): Promise<Group> {
    const group = await prisma.group.findFirst({ where: { id, tenantId } });
    if (!group) throw new NotFoundError('Group not found');

    return prisma.group.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy,
      },
    });
  }

  public async restore(id: string, tenantId: string, updatedBy: string): Promise<Group> {
    const group = await prisma.group.findFirst({ where: { id, tenantId } });
    if (!group) throw new NotFoundError('Group not found');

    return prisma.group.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        updatedBy,
      },
    });
  }

  // --- Group Members ---

  public async addMember(groupId: string, tenantId: string, userId: string): Promise<void> {
    // 1. Verify group belongs to tenant
    const group = await prisma.group.findFirst({ where: { id: groupId, tenantId, deletedAt: null } });
    if (!group) throw new NotFoundError('Group not found');

    // 2. Verify user belongs to tenant
    const user = await prisma.user.findFirst({ where: { id: userId, tenantId, deletedAt: null } });
    if (!user) throw new NotFoundError('User not found within this tenant');

    // 3. Check for existing membership
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) throw new ConflictError('User is already a member of this group');

    // 4. Transaction: create member and increment count
    await prisma.$transaction(async (tx) => {
      await tx.groupMember.create({
        data: { groupId, userId },
      });
      await tx.group.update({
        where: { id: groupId },
        data: { memberCount: { increment: 1 } },
      });
    });
  }

  public async removeMember(groupId: string, tenantId: string, userId: string): Promise<void> {
    // 1. Verify group belongs to tenant
    const group = await prisma.group.findFirst({ where: { id: groupId, tenantId, deletedAt: null } });
    if (!group) throw new NotFoundError('Group not found');

    // 2. Check for existing membership
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!existing) throw new NotFoundError('User is not a member of this group');

    // 3. Transaction: delete member and decrement count
    await prisma.$transaction(async (tx) => {
      await tx.groupMember.delete({
        where: { groupId_userId: { groupId, userId } },
      });
      await tx.group.update({
        where: { id: groupId },
        data: { memberCount: { decrement: 1 } },
      });
    });
  }

  public async listMembers(groupId: string, tenantId: string, params: { page: number; limit: number }) {
    const group = await prisma.group.findFirst({ where: { id: groupId, tenantId, deletedAt: null } });
    if (!group) throw new NotFoundError('Group not found');

    const skip = (params.page - 1) * params.limit;

    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where: { groupId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, employeeId: true, department: true }
          }
        },
        skip,
        take: params.limit,
        orderBy: { joinedAt: 'desc' },
      }),
      prisma.groupMember.count({ where: { groupId } }),
    ]);

    return {
      data: members.map(m => ({ joinedAt: m.joinedAt, ...m.user })),
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}

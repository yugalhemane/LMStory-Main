import { prisma } from '../../../database/prisma';
import { Prisma, User } from '@prisma/client';

export class UserRepository {
  public async create(tenantId: string, data: Prisma.UserUncheckedCreateInput): Promise<User> {
    data.tenantId = tenantId;
    return prisma.user.create({ data });
  }

  public async findById(id: string, tenantId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  public async findByIdWithDeleted(id: string, tenantId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, tenantId },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    // Email must be globally unique across all tenants
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  public async findByEmployeeId(employeeId: string, tenantId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { employeeId, tenantId, deletedAt: null },
    });
  }

  public async update(id: string, tenantId: string, data: Prisma.UserUncheckedUpdateInput): Promise<User> {
    // Ensure we only update if it belongs to the tenant
    return prisma.user.update({
      where: { id, tenantId },
      data,
    });
  }

  public async searchAndPaginate(
    tenantId: string,
    params: {
      search?: string;
      department?: string;
      status?: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
      page: number;
      limit: number;
    }
  ) {
    const where: Prisma.UserWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { employeeId: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.department) {
      where.department = params.department;
    }

    if (params.status) {
      where.status = params.status;
    }

    const skip = (params.page - 1) * params.limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  public async softDelete(id: string, tenantId: string, updatedBy: string): Promise<User> {
    return prisma.user.update({
      where: { id, tenantId },
      data: { 
        deletedAt: new Date(),
        status: 'DEACTIVATED',
        isActive: false,
        updatedBy 
      },
    });
  }

  public async restore(id: string, tenantId: string, updatedBy: string): Promise<User> {
    return prisma.user.update({
      where: { id, tenantId },
      data: { 
        deletedAt: null,
        status: 'ACTIVE',
        isActive: true,
        updatedBy 
      },
    });
  }
}

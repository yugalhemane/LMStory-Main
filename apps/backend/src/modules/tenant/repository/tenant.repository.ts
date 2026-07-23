import { prisma } from '../../../database/prisma';
import { Prisma, Tenant } from '@prisma/client';

export class TenantRepository {
  public async create(data: Prisma.TenantCreateInput) {
    return prisma.tenant.create({
      data,
      include: {
        settings: true,
        storage: true,
      },
    });
  }

  public async findById(id: string): Promise<Tenant | null> {
    return prisma.tenant.findFirst({
      where: { id, deletedAt: null },
      include: {
        settings: true,
        storage: true,
        SubscriptionPlan: true,
      },
    });
  }
  
  public async findByIdWithDeleted(id: string): Promise<Tenant | null> {
    return prisma.tenant.findUnique({
      where: { id },
    });
  }

  public async findBySlug(slug: string): Promise<Tenant | null> {
    return prisma.tenant.findFirst({
      where: { slug, deletedAt: null },
    });
  }

  public async findByDomain(domain: string): Promise<Tenant | null> {
    return prisma.tenant.findFirst({
      where: { domain, deletedAt: null },
    });
  }

  public async findAll(): Promise<Tenant[]> {
    return prisma.tenant.findMany({
      where: { deletedAt: null },
      include: {
        SubscriptionPlan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async update(id: string, data: Prisma.TenantUpdateInput): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id },
      data,
      include: {
        settings: true,
        storage: true,
      },
    });
  }

  public async softDelete(id: string): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });
  }

  public async restore(id: string): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id },
      data: { deletedAt: null, status: 'PENDING' },
    });
  }

  public async generateUniqueCode(): Promise<string> {
    const count = await prisma.tenant.count({
      // Count all including deleted to ensure absolute unique sequence
    });
    return `TEN${String(count + 1).padStart(6, '0')}`;
  }
}

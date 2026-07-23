import { TenantRepository } from '../repository/tenant.repository';
import { CreateTenantDto, UpdateTenantDto } from '../dto/tenant.dto';
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import { Prisma } from '@prisma/client';

export class TenantService {
  private tenantRepository: TenantRepository;

  constructor() {
    this.tenantRepository = new TenantRepository();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  public async createTenant(data: CreateTenantDto) {
    const slug = this.generateSlug(data.name);

    const existingSlug = await this.tenantRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('A tenant with a similar name already exists (slug conflict).');
    }

    if (data.domain) {
      const existingDomain = await this.tenantRepository.findByDomain(data.domain);
      if (existingDomain) {
        throw new ConflictError('Domain is already mapped to another tenant.');
      }
    }

    const code = await this.tenantRepository.generateUniqueCode();

    const createInput: Prisma.TenantCreateInput = {
      name: data.name,
      slug,
      code,
      domain: data.domain || null,
      industry: data.industry || null,
      status: 'PENDING',
      settings: {
        create: {}
      },
      storage: {
        create: {}
      }
    };

    if (data.subscriptionPlanId) {
      createInput.SubscriptionPlan = {
        connect: { id: data.subscriptionPlanId }
      };
    }

    const tenant = await this.tenantRepository.create(createInput);
    logger.info(`Tenant Created: ${tenant.id} (${tenant.code})`);
    return tenant;
  }

  public async getTenant(id: string) {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundError('Tenant not found');
    return tenant;
  }

  public async listTenants() {
    return this.tenantRepository.findAll();
  }

  public async updateTenant(id: string, data: UpdateTenantDto) {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundError('Tenant not found');

    if (data.domain && data.domain !== tenant.domain) {
      const existingDomain = await this.tenantRepository.findByDomain(data.domain);
      if (existingDomain) {
        throw new ConflictError('Domain is already mapped to another tenant.');
      }
    }

    const updateData: Prisma.TenantUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.domain !== undefined) updateData.domain = data.domain;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.subscriptionPlanId) {
      updateData.SubscriptionPlan = {
        connect: { id: data.subscriptionPlanId }
      };
    }

    const updated = await this.tenantRepository.update(id, updateData);
    logger.info(`Tenant Updated: ${id}`);
    return updated;
  }

  public async softDeleteTenant(id: string) {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundError('Tenant not found');

    await this.tenantRepository.softDelete(id);
    logger.info(`Tenant Deleted (Soft): ${id}`);
  }

  public async restoreTenant(id: string) {
    const tenant = await this.tenantRepository.findByIdWithDeleted(id);
    if (!tenant) throw new NotFoundError('Tenant not found');
    
    if (!tenant.deletedAt) {
      throw new ValidationError('Tenant is not deleted');
    }

    // Verify slug and domain are still available
    const existingSlug = await this.tenantRepository.findBySlug(tenant.slug);
    if (existingSlug && existingSlug.id !== tenant.id) {
      throw new ConflictError('Cannot restore: Slug is currently in use by another active tenant.');
    }

    if (tenant.domain) {
      const existingDomain = await this.tenantRepository.findByDomain(tenant.domain);
      if (existingDomain && existingDomain.id !== tenant.id) {
        throw new ConflictError('Cannot restore: Domain is currently in use by another active tenant.');
      }
    }

    const restored = await this.tenantRepository.restore(id);
    logger.info(`Tenant Restored: ${id}`);
    return restored;
  }
}

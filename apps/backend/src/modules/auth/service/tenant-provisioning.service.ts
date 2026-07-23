import { prisma } from '../../../database/prisma';

export class TenantProvisioningService {
  public async provisionTrialTenant(
    tenantName: string,
    adminEmail: string,
    adminFirstName: string,
    adminLastName: string,
    passwordHash: string
  ) {
    // 14 days trial by default
    const trialStartedAt = new Date();
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const code = tenantName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000);
      const slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          code,
          slug,
          status: 'ACTIVE',
        },
      });

      // Find trial plan
      const trialPlan = await tx.subscriptionPlan.findFirst({ where: { isActive: true } });
      if (!trialPlan) throw new Error('No subscription plans available in the system');

      // Create Subscription Account
      await tx.subscriptionAccount.create({
        data: {
          tenantId: tenant.id,
          subscriptionPlanId: trialPlan.id,
          providerCustomerId: null, // Will be populated when they add billing
          status: 'TRIAL',
          trialStartedAt,
          trialEndsAt,
        },
      });

      // Create Admin User
      const user = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: adminFirstName,
          lastName: adminLastName,
          role: 'TENANT_ADMIN',
          status: 'ACTIVE',
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });
  }
}

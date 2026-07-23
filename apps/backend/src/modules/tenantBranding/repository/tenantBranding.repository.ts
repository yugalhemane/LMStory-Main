import { prisma } from '../../../database/prisma';

export class TenantBrandingRepository {
  public async getSettings(tenantId: string) {
    return prisma.tenantSettings.findUnique({
      where: { tenantId }
    });
  }

  public async updateSettings(tenantId: string, brandingData: any) {
    return prisma.tenantSettings.upsert({
      where: { tenantId },
      update: {
        branding: brandingData,
      },
      create: {
        tenantId,
        branding: brandingData,
      },
    });
  }
}

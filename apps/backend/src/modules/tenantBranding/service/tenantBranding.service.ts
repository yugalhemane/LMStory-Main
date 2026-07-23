import { TenantBrandingRepository } from '../repository/tenantBranding.repository';
import { UpdateBrandingDto } from '../dto/tenantBranding.dto';
import { logger } from '../../../shared/logger';

export class TenantBrandingService {
  private repository: TenantBrandingRepository;

  constructor() {
    this.repository = new TenantBrandingRepository();
  }

  public async getBranding(tenantId: string) {
    const settings = await this.repository.getSettings(tenantId);
    if (!settings) {
      // Return default branding if not set
      return {};
    }
    return settings.branding || {};
  }

  public async updateBranding(tenantId: string, data: UpdateBrandingDto) {
    const existingSettings = await this.repository.getSettings(tenantId);
    
    // Merge existing branding with new updates
    const currentBranding = (existingSettings?.branding as any) || {};
    const updatedBranding = {
      ...currentBranding,
      ...data
    };

    const settings = await this.repository.updateSettings(tenantId, updatedBranding);
    logger.info(`Tenant Branding Updated: ${tenantId}`);
    return settings.branding;
  }
}

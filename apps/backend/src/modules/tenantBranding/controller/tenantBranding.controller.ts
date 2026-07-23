import { Request, Response } from 'express';
import { TenantBrandingService } from '../service/tenantBranding.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class TenantBrandingController {
  private service: TenantBrandingService;

  constructor() {
    this.service = new TenantBrandingService();
  }

  public getBranding = async (req: Request, res: Response) => {
    const userTenantId = (req as any).user?.tenantId;
    const hostTenantId = (req as any).tenant?.id;

    if (userTenantId && hostTenantId && userTenantId !== hostTenantId) {
      return res.status(403).json(ApiResponse.failure('Cross-tenant access denied'));
    }

    const tenantId = hostTenantId || userTenantId;
    if (!tenantId) {
      return res.status(400).json(ApiResponse.failure('Tenant Context Missing'));
    }
    const branding = await this.service.getBranding(tenantId);
    return res.status(200).json(ApiResponse.success('Tenant branding retrieved', branding));
  };

  public updateBranding = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const branding = await this.service.updateBranding(tenantId, req.body);
    return res.status(200).json(ApiResponse.success('Tenant branding updated', branding));
  };
}

import { Request, Response } from 'express';
import { TenantService } from '../service/tenant.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class TenantController {
  private tenantService: TenantService;

  constructor() {
    this.tenantService = new TenantService();
  }

  public createTenant = async (req: Request, res: Response) => {
    const tenant = await this.tenantService.createTenant(req.body);
    return res.status(201).json(ApiResponse.success('Tenant created successfully', tenant));
  };

  public getTenant = async (req: Request, res: Response) => {
    const tenant = await this.tenantService.getTenant(req.params.id as string);
    return res.status(200).json(ApiResponse.success('Tenant retrieved successfully', tenant));
  };

  public listTenants = async (_req: Request, res: Response) => {
    const tenants = await this.tenantService.listTenants();
    return res.status(200).json(ApiResponse.success('Tenants retrieved successfully', tenants));
  };

  public updateTenant = async (req: Request, res: Response) => {
    const tenant = await this.tenantService.updateTenant(req.params.id as string, req.body);
    return res.status(200).json(ApiResponse.success('Tenant updated successfully', tenant));
  };

  public deleteTenant = async (req: Request, res: Response) => {
    await this.tenantService.softDeleteTenant(req.params.id as string);
    return res.status(200).json(ApiResponse.success('Tenant deleted successfully'));
  };

  public restoreTenant = async (req: Request, res: Response) => {
    const tenant = await this.tenantService.restoreTenant(req.params.id as string);
    return res.status(200).json(ApiResponse.success('Tenant restored successfully', tenant));
  };
}

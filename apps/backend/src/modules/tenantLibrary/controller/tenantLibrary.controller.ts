import { Request, Response } from 'express';
import { TenantLibraryService } from '../service/tenantLibrary.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class TenantLibraryController {
  private tenantLibraryService: TenantLibraryService;

  constructor() {
    this.tenantLibraryService = new TenantLibraryService();
  }

  public importContent = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const content = await this.tenantLibraryService.importContent(tenantId, req.body, currentUserId);
    return res.status(201).json(ApiResponse.success('Content imported successfully', content));
  };

  public getContent = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const content = await this.tenantLibraryService.getContent(req.params.id as string, tenantId);
    return res.status(200).json(ApiResponse.success('Content retrieved successfully', content));
  };

  public listContent = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.tenantLibraryService.listContent(tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Content retrieved successfully', result));
  };

  public updateContent = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const content = await this.tenantLibraryService.updateContent(req.params.id as string, tenantId, req.body, currentUserId);
    return res.status(200).json(ApiResponse.success('Content overrides updated successfully', content));
  };

  public deleteContent = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    await this.tenantLibraryService.softDeleteContent(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Content deleted successfully'));
  };

  public restoreContent = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const content = await this.tenantLibraryService.restoreContent(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Content restored successfully', content));
  };

  // --- V1.1 Asset API ---

  public presignUpload = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const result = await this.tenantLibraryService.presignUpload(req.params.id as string, tenantId, req.body, currentUserId);
    return res.status(200).json(ApiResponse.success('Presigned URL generated', result));
  };

  public confirmUpload = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const result = await this.tenantLibraryService.confirmUpload(req.params.id as string, tenantId, req.body, currentUserId);
    return res.status(200).json(ApiResponse.success('Upload confirmed', result));
  };

  public createExternalLink = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const result = await this.tenantLibraryService.createExternalLink(req.params.id as string, tenantId, req.body, currentUserId);
    return res.status(201).json(ApiResponse.success('External link created', result));
  };
}

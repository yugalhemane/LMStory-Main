import { Request, Response } from 'express';
import { CampaignService } from '../service/campaign.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class CampaignController {
  private campaignService: CampaignService;

  constructor() {
    this.campaignService = new CampaignService();
  }

  public createCampaign = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const campaign = await this.campaignService.createCampaign(tenantId, req.body, currentUserId);
    return res.status(201).json(ApiResponse.success('Campaign created successfully', campaign));
  };

  public getCampaign = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const campaign = await this.campaignService.getCampaign(req.params.id as string, tenantId);
    return res.status(200).json(ApiResponse.success('Campaign retrieved successfully', campaign));
  };

  public listCampaigns = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.campaignService.listCampaigns(tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Campaigns retrieved successfully', result));
  };

  public updateCampaign = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const campaign = await this.campaignService.updateCampaign(req.params.id as string, tenantId, req.body, currentUserId);
    return res.status(200).json(ApiResponse.success('Campaign updated successfully', campaign));
  };

  public deleteCampaign = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    await this.campaignService.deleteCampaign(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Campaign deleted successfully'));
  };

  public restoreCampaign = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const campaign = await this.campaignService.restoreCampaign(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Campaign restored successfully', campaign));
  };

  public publishCampaign = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const campaign = await this.campaignService.publishCampaign(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Campaign published successfully', campaign));
  };

  public pauseCampaign = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const campaign = await this.campaignService.pauseCampaign(req.params.id as string, tenantId);
    return res.status(200).json(ApiResponse.success('Campaign paused successfully', campaign));
  };

  // --- ATTACHMENTS ---

  public attachCourse = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.campaignService.attachCourse(req.params.id as string, req.body.courseId, tenantId);
    return res.status(201).json(ApiResponse.success('Course attached successfully'));
  };

  public removeCourse = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.campaignService.removeCourse(req.params.id as string, req.params.courseId as string, tenantId);
    return res.status(200).json(ApiResponse.success('Course removed successfully'));
  };

  public assignGroup = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.campaignService.assignGroup(req.params.id as string, req.body.groupId, tenantId);
    return res.status(201).json(ApiResponse.success('Group assigned successfully'));
  };

  public unassignGroup = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.campaignService.unassignGroup(req.params.id as string, req.params.groupId as string, tenantId);
    return res.status(200).json(ApiResponse.success('Group unassigned successfully'));
  };

  public assignUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.campaignService.assignUser(req.params.id as string, req.body.userId, tenantId);
    return res.status(201).json(ApiResponse.success('User assigned successfully'));
  };

  public unassignUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.campaignService.unassignUser(req.params.id as string, req.params.userId as string, tenantId);
    return res.status(200).json(ApiResponse.success('User unassigned successfully'));
  };
}

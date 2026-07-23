import { Request, Response } from 'express';
import { GroupService } from '../service/group.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class GroupController {
  private groupService: GroupService;

  constructor() {
    this.groupService = new GroupService();
  }

  public createGroup = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const group = await this.groupService.createGroup(tenantId, req.body, currentUserId);
    return res.status(201).json(ApiResponse.success('Group created successfully', group));
  };

  public getGroup = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const group = await this.groupService.getGroup(req.params.id as string, tenantId);
    return res.status(200).json(ApiResponse.success('Group retrieved successfully', group));
  };

  public listGroups = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.groupService.listGroups(tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Groups retrieved successfully', result));
  };

  public updateGroup = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const group = await this.groupService.updateGroup(req.params.id as string, tenantId, req.body, currentUserId);
    return res.status(200).json(ApiResponse.success('Group updated successfully', group));
  };

  public deleteGroup = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    await this.groupService.softDeleteGroup(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Group deleted successfully'));
  };

  public restoreGroup = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const group = await this.groupService.restoreGroup(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Group restored successfully', group));
  };

  public addMember = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.groupService.addMember(req.params.id as string, tenantId, req.body.userId);
    return res.status(200).json(ApiResponse.success('Member added successfully'));
  };

  public removeMember = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.groupService.removeMember(req.params.id as string, tenantId, req.params.userId as string);
    return res.status(200).json(ApiResponse.success('Member removed successfully'));
  };

  public listMembers = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.groupService.listMembers(req.params.id as string, tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Members retrieved successfully', result));
  };
}

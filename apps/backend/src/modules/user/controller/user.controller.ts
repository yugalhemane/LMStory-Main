import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public createUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const user = await this.userService.createUser(tenantId, req.body, currentUserId);
    return res.status(201).json(ApiResponse.success('User created successfully', user));
  };

  public getUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const user = await this.userService.getUser(req.params.id as string, tenantId);
    return res.status(200).json(ApiResponse.success('User retrieved successfully', user));
  };

  public listUsers = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.userService.listUsers(tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Users retrieved successfully', result));
  };

  public updateUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const user = await this.userService.updateUser(req.params.id as string, tenantId, req.body, currentUserId);
    return res.status(200).json(ApiResponse.success('User updated successfully', user));
  };

  public deactivateUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const user = await this.userService.deactivateUser(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('User deactivated successfully', user));
  };

  public activateUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const user = await this.userService.activateUser(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('User activated successfully', user));
  };

  public deleteUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    await this.userService.softDeleteUser(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('User deleted successfully'));
  };

  public restoreUser = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const user = await this.userService.restoreUser(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('User restored successfully', user));
  };
}

import { Request, Response } from 'express';
import { NotificationService } from '../service/notification.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // ==============================
  // NOTIFICATIONS (Learner Scope)
  // ==============================
  public getMyNotifications = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const notifications = await this.notificationService.getMyNotifications(tenantId, userId, page, limit);
    return res.status(200).json(ApiResponse.success('Notifications retrieved successfully', notifications));
  };

  public getNotification = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const notification = await this.notificationService.getNotification(req.params.id as string, tenantId, userId);
    return res.status(200).json(ApiResponse.success('Notification retrieved successfully', notification));
  };

  public markAsRead = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const notification = await this.notificationService.markAsRead(req.params.id as string, tenantId, userId);
    return res.status(200).json(ApiResponse.success('Notification marked as read', notification));
  };

  public markAllAsRead = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const result = await this.notificationService.markAllAsRead(tenantId, userId);
    return res.status(200).json(ApiResponse.success('All notifications marked as read', result));
  };

  public deleteNotification = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    await this.notificationService.deleteNotification(req.params.id as string, tenantId, userId);
    return res.status(200).json(ApiResponse.success('Notification deleted successfully', null));
  };

  // ==============================
  // PREFERENCES (Learner Scope)
  // ==============================
  public getPreferences = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const preferences = await this.notificationService.getPreferences(tenantId, userId);
    return res.status(200).json(ApiResponse.success('Preferences retrieved successfully', preferences));
  };

  public updatePreference = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const preference = await this.notificationService.updatePreference(tenantId, userId, req.body);
    return res.status(200).json(ApiResponse.success('Preference updated successfully', preference));
  };

  // ==============================
  // TEMPLATES (Admin Scope)
  // ==============================
  public getTemplates = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const templates = await this.notificationService.getTemplates(tenantId);
    return res.status(200).json(ApiResponse.success('Templates retrieved successfully', templates));
  };

  public createTemplate = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const template = await this.notificationService.createTemplate(tenantId, req.body);
    return res.status(201).json(ApiResponse.success('Template created successfully', template));
  };

  public updateTemplate = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const template = await this.notificationService.updateTemplate(req.params.id as string, tenantId, req.body);
    return res.status(200).json(ApiResponse.success('Template updated successfully', template));
  };

  public deleteTemplate = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.notificationService.deleteTemplate(req.params.id as string, tenantId);
    return res.status(200).json(ApiResponse.success('Template deleted successfully', null));
  };
}

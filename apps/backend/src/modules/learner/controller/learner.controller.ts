import { Request, Response } from 'express';
import { LearnerService } from '../service/learner.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class LearnerController {
  private learnerService: LearnerService;

  constructor() {
    this.learnerService = new LearnerService();
  }

  public getDashboard = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const dashboard = await this.learnerService.getDashboard(tenantId, userId);
    return res.status(200).json(ApiResponse.success('Dashboard retrieved successfully', dashboard));
  };

  public getEnrollmentDetails = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const details = await this.learnerService.getEnrollmentDetails(req.params.enrollmentId as string, tenantId, userId);
    return res.status(200).json(ApiResponse.success('Enrollment details retrieved successfully', details));
  };

  public updateProgress = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const result = await this.learnerService.updateProgress(req.params.progressId as string, tenantId, userId, req.body);
    return res.status(200).json(ApiResponse.success('Progress updated successfully', result));
  };

  // V1.1 Explicit Events & Playback

  public markViewed = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const result = await this.learnerService.markViewed(req.params.progressId as string, tenantId, userId);
    return res.status(200).json(ApiResponse.success('Marked as viewed', result));
  };

  public markCompleted = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const result = await this.learnerService.markCompleted(req.params.progressId as string, tenantId, userId);
    return res.status(200).json(ApiResponse.success('Marked as completed', result));
  };

  public getPlaybackUrl = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const result = await this.learnerService.getPlaybackUrl(req.params.progressId as string, tenantId, userId);
    return res.status(200).json(ApiResponse.success('Playback URL generated', result));
  };
}

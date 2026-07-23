import { Request, Response } from 'express';
import { EnrollmentService } from '../service/enrollment.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  public createEnrollment = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    // Map single user payload to bulk payload under the hood
    const bulkData = {
      campaignId: req.body.campaignId,
      userIds: [req.body.userId]
    };
    const result = await this.enrollmentService.bulkEnroll(tenantId, bulkData, currentUserId);
    return res.status(201).json(ApiResponse.success(result.message));
  };

  public bulkEnrollment = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const result = await this.enrollmentService.bulkEnroll(tenantId, req.body, currentUserId);
    return res.status(201).json(ApiResponse.success(result.message));
  };

  public getEnrollment = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const enrollment = await this.enrollmentService.getEnrollment(req.params.id as string, tenantId);
    return res.status(200).json(ApiResponse.success('Enrollment retrieved successfully', enrollment));
  };

  public listEnrollments = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.enrollmentService.listEnrollments(tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Enrollments retrieved successfully', result));
  };

  public updateProgress = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    await this.enrollmentService.updateItemProgress(req.params.progressId as string, tenantId, currentUserId, req.body);
    return res.status(200).json(ApiResponse.success('Progress updated successfully'));
  };

  public deleteEnrollment = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    await this.enrollmentService.deleteEnrollment(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Enrollment deleted successfully'));
  };
}

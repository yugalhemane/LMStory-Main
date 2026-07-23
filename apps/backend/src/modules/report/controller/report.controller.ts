import { Request, Response } from 'express';
import { ReportService } from '../service/report.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  public getDashboardSummary = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const summary = await this.reportService.getDashboardSummary(tenantId);
    return res.status(200).json(ApiResponse.success('Dashboard summary retrieved successfully', summary));
  };

  public getUsersReport = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.reportService.getUsersReport(tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Users report retrieved successfully', result));
  };

  public getCoursesReport = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.reportService.getCoursesReport(tenantId);
    return res.status(200).json(ApiResponse.success('Courses report retrieved successfully', result));
  };

  public getCampaignsReport = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.reportService.getCampaignsReport(tenantId);
    return res.status(200).json(ApiResponse.success('Campaigns report retrieved successfully', result));
  };

  public getGroupsReport = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.reportService.getGroupsReport(tenantId);
    return res.status(200).json(ApiResponse.success('Groups report retrieved successfully', result));
  };

  public getLearnerReport = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = req.params.userId;
    const result = await this.reportService.getLearnerReport(userId as string, tenantId);
    return res.status(200).json(ApiResponse.success('Learner report retrieved successfully', result));
  };

  public getCertificatesReport = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.reportService.getCertificatesReport(tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Certificates report retrieved successfully', result));
  };
}

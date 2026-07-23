import { Request, Response } from 'express';
import { CertificateService } from '../service/certificate.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class CertificateController {
  private certificateService: CertificateService;

  constructor() {
    this.certificateService = new CertificateService();
  }

  public issueCertificate = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const certificate = await this.certificateService.issueCertificate(req.params.enrollmentId as string, tenantId, currentUserId);
    return res.status(201).json(ApiResponse.success('Certificate issued successfully', certificate));
  };

  public revokeCertificate = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const certificate = await this.certificateService.revokeCertificate(req.params.id as string, tenantId, currentUserId, req.body);
    return res.status(200).json(ApiResponse.success('Certificate revoked successfully', certificate));
  };

  public getMyCertificates = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;
    const certificates = await this.certificateService.getMyCertificates(userId, tenantId);
    return res.status(200).json(ApiResponse.success('Certificates retrieved successfully', certificates));
  };

  public verifyPublicToken = async (req: Request, res: Response) => {
    const certificate = await this.certificateService.verifyPublicToken(req.params.token as string);
    return res.status(200).json(ApiResponse.success('Certificate is valid', certificate));
  };
}

import { z } from 'zod';
import { 
  userReportQuerySchema, 
  certificateReportQuerySchema,
  standardReportQuerySchema
} from '../validation/report.validation';

export type UserReportQueryDto = z.infer<typeof userReportQuerySchema>['query'];
export type CertificateReportQueryDto = z.infer<typeof certificateReportQuerySchema>['query'];
export type StandardReportQueryDto = z.infer<typeof standardReportQuerySchema>['query'];

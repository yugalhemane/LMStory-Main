import { z } from 'zod';
import { 
  createEnrollmentSchema, 
  bulkEnrollmentSchema, 
  listEnrollmentsSchema,
  updateProgressSchema
} from '../validation/enrollment.validation';

export type CreateEnrollmentDto = z.infer<typeof createEnrollmentSchema>['body'];
export type BulkEnrollmentDto = z.infer<typeof bulkEnrollmentSchema>['body'];
export type ListEnrollmentsDto = z.infer<typeof listEnrollmentsSchema>['query'];
export type UpdateProgressDto = z.infer<typeof updateProgressSchema>['body'];

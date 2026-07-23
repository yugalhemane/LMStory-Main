import { z } from 'zod';
import { createTenantSchema, updateTenantSchema } from '../validation/tenant.validation';

export type CreateTenantDto = z.infer<typeof createTenantSchema>['body'];
export type UpdateTenantDto = z.infer<typeof updateTenantSchema>['body'];

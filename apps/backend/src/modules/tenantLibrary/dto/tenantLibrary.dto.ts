import { z } from 'zod';
import { importGlobalContentSchema, updateTenantLibrarySchema, listTenantLibrarySchema, presignUploadSchema, confirmUploadSchema, createExternalLinkSchema } from '../validation/tenantLibrary.validation';

export type ImportGlobalContentDto = z.infer<typeof importGlobalContentSchema>['body'];
export type UpdateTenantLibraryDto = z.infer<typeof updateTenantLibrarySchema>['body'];
export type ListTenantLibraryDto = z.infer<typeof listTenantLibrarySchema>['query'];
export type PresignUploadDto = z.infer<typeof presignUploadSchema>['body'];
export type ConfirmUploadDto = z.infer<typeof confirmUploadSchema>['body'];
export type CreateExternalLinkDto = z.infer<typeof createExternalLinkSchema>['body'];

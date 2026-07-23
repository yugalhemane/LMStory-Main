import { Router } from 'express';
import { TenantLibraryController } from '../controller/tenantLibrary.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { 
  importGlobalContentSchema, 
  updateTenantLibrarySchema, 
  listTenantLibrarySchema,
  presignUploadSchema,
  confirmUploadSchema,
  createExternalLinkSchema
} from '../validation/tenantLibrary.validation';

const router = Router();
const tenantLibraryController = new TenantLibraryController();

// Restrict to Tenant Admin (Temporary RBAC Placeholder)
router.use(requireAuth, requireTenantAdmin);

router.post('/import', validate(importGlobalContentSchema as any), asyncHandler(tenantLibraryController.importContent));
router.get('/', validate(listTenantLibrarySchema as any), asyncHandler(tenantLibraryController.listContent));
router.get('/:id', asyncHandler(tenantLibraryController.getContent));
router.patch('/:id', validate(updateTenantLibrarySchema as any), asyncHandler(tenantLibraryController.updateContent));
router.delete('/:id', asyncHandler(tenantLibraryController.deleteContent));
router.post('/:id/restore', asyncHandler(tenantLibraryController.restoreContent));

// --- V1.1 Asset API ---
router.post('/:id/assets/presign', validate(presignUploadSchema as any), asyncHandler(tenantLibraryController.presignUpload));
router.post('/:id/assets/confirm', validate(confirmUploadSchema as any), asyncHandler(tenantLibraryController.confirmUpload));
router.post('/:id/assets/link', validate(createExternalLinkSchema as any), asyncHandler(tenantLibraryController.createExternalLink));

export default router;


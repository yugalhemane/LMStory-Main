import { Router } from 'express';
import { TenantController } from '../controller/tenant.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireSuperAdmin } from '../../../shared/middlewares/requireSuperAdmin';
import { createTenantSchema, updateTenantSchema } from '../validation/tenant.validation';

const router = Router();
const tenantController = new TenantController();

// Apply global middlewares to all tenant routes
router.use(requireAuth, requireSuperAdmin);

router.post('/', validate(createTenantSchema as any), asyncHandler(tenantController.createTenant));
router.get('/', asyncHandler(tenantController.listTenants));
router.get('/:id', asyncHandler(tenantController.getTenant));
router.patch('/:id', validate(updateTenantSchema as any), asyncHandler(tenantController.updateTenant));
router.delete('/:id', asyncHandler(tenantController.deleteTenant));
router.post('/:id/restore', asyncHandler(tenantController.restoreTenant));

export default router;

import { Router } from 'express';
import { TenantBrandingController } from '../controller/tenantBranding.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { updateBrandingSchema } from '../validation/tenantBranding.validation';

const router = Router();
const controller = new TenantBrandingController();

// GET can be public (for custom domain login pages) if req.tenant is populated, 
// but for now we will assume it might be requested with or without auth.
// Let's create an unprotected route for public access, and protected for admin.
router.get('/', asyncHandler(controller.getBranding));

// Admin only update
router.patch(
  '/',
  requireAuth,
  requireTenantAdmin,
  validate(updateBrandingSchema as any),
  asyncHandler(controller.updateBranding)
);

export default router;

import { Router } from 'express';
import { EnrollmentController } from '../controller/enrollment.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { 
  createEnrollmentSchema, 
  bulkEnrollmentSchema, 
  listEnrollmentsSchema,
  updateProgressSchema
} from '../validation/enrollment.validation';

const router = Router();
const enrollmentController = new EnrollmentController();

// Restrict to Tenant Admin (in a real app, learners would have a separate LearnerController without requireTenantAdmin)
router.use(requireAuth, requireTenantAdmin);

router.post('/', validate(createEnrollmentSchema as any), asyncHandler(enrollmentController.createEnrollment));
router.post('/bulk', validate(bulkEnrollmentSchema as any), asyncHandler(enrollmentController.bulkEnrollment));

router.get('/', validate(listEnrollmentsSchema as any), asyncHandler(enrollmentController.listEnrollments));
router.get('/:id', asyncHandler(enrollmentController.getEnrollment));
router.delete('/:id', asyncHandler(enrollmentController.deleteEnrollment));

router.patch('/progress/:progressId', validate(updateProgressSchema as any), asyncHandler(enrollmentController.updateProgress));

export default router;

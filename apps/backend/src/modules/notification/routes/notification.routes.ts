import { Router } from 'express';
import { NotificationController } from '../controller/notification.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { createTemplateSchema, updateTemplateSchema, updatePreferenceSchema } from '../validation/notification.validation';

const router = Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(requireAuth);

// ==========================================
// PREFERENCES (Learner Scope)
// ==========================================
router.get('/preferences', asyncHandler(notificationController.getPreferences));
router.patch('/preferences', validate(updatePreferenceSchema as any), asyncHandler(notificationController.updatePreference));

// ==========================================
// NOTIFICATIONS (Learner Scope)
// ==========================================
router.get('/', asyncHandler(notificationController.getMyNotifications));
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));
router.get('/:id', asyncHandler(notificationController.getNotification));
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));
router.delete('/:id', asyncHandler(notificationController.deleteNotification));

// ==========================================
// TEMPLATES (Admin Scope)
// ==========================================
// These routes require Tenant Admin privileges
const templateRouter = Router();
templateRouter.use(requireTenantAdmin);
templateRouter.get('/', asyncHandler(notificationController.getTemplates));
templateRouter.post('/', validate(createTemplateSchema as any), asyncHandler(notificationController.createTemplate));
templateRouter.patch('/:id', validate(updateTemplateSchema as any), asyncHandler(notificationController.updateTemplate));
templateRouter.delete('/:id', asyncHandler(notificationController.deleteTemplate));

router.use('/templates', templateRouter);

export default router;

import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { createUserSchema, updateUserSchema, listUsersSchema } from '../validation/user.validation';

const router = Router();
const userController = new UserController();

// Apply auth and tenant admin restriction to all user management routes
router.use(requireAuth, requireTenantAdmin);

router.post('/', validate(createUserSchema as any), asyncHandler(userController.createUser));
router.get('/', validate(listUsersSchema as any), asyncHandler(userController.listUsers));
router.get('/:id', asyncHandler(userController.getUser));
router.patch('/:id', validate(updateUserSchema as any), asyncHandler(userController.updateUser));

router.post('/:id/activate', asyncHandler(userController.activateUser));
router.post('/:id/deactivate', asyncHandler(userController.deactivateUser));
router.post('/:id/restore', asyncHandler(userController.restoreUser));
router.delete('/:id', asyncHandler(userController.deleteUser));

export default router;

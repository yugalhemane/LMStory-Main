import { Router } from 'express';
import { GroupController } from '../controller/group.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { createGroupSchema, updateGroupSchema, listGroupsSchema, addMemberSchema } from '../validation/group.validation';

const router = Router();
const groupController = new GroupController();

// Restrict to Tenant Admin (Temporary RBAC Placeholder)
router.use(requireAuth, requireTenantAdmin);

router.post('/', validate(createGroupSchema as any), asyncHandler(groupController.createGroup));
router.get('/', validate(listGroupsSchema as any), asyncHandler(groupController.listGroups));
router.get('/:id', asyncHandler(groupController.getGroup));
router.patch('/:id', validate(updateGroupSchema as any), asyncHandler(groupController.updateGroup));
router.delete('/:id', asyncHandler(groupController.deleteGroup));
router.post('/:id/restore', asyncHandler(groupController.restoreGroup));

router.post('/:id/members', validate(addMemberSchema as any), asyncHandler(groupController.addMember));
router.delete('/:id/members/:userId', asyncHandler(groupController.removeMember));
router.get('/:id/members', asyncHandler(groupController.listMembers));

export default router;

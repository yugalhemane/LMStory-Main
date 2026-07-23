import { Router } from 'express';
import { CampaignController } from '../controller/campaign.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { 
  createCampaignSchema, 
  updateCampaignSchema, 
  listCampaignsSchema,
  attachCourseSchema,
  assignGroupSchema,
  assignUserSchema
} from '../validation/campaign.validation';

const router = Router();
const campaignController = new CampaignController();

// Restrict to Tenant Admin
router.use(requireAuth, requireTenantAdmin);

// Campaign CRUD
router.post('/', validate(createCampaignSchema as any), asyncHandler(campaignController.createCampaign));
router.get('/', validate(listCampaignsSchema as any), asyncHandler(campaignController.listCampaigns));
router.get('/:id', asyncHandler(campaignController.getCampaign));
router.patch('/:id', validate(updateCampaignSchema as any), asyncHandler(campaignController.updateCampaign));
router.delete('/:id', asyncHandler(campaignController.deleteCampaign));
router.post('/:id/restore', asyncHandler(campaignController.restoreCampaign));

// Actions
router.post('/:id/publish', asyncHandler(campaignController.publishCampaign));
router.post('/:id/pause', asyncHandler(campaignController.pauseCampaign));

// Attachments
router.post('/:id/courses', validate(attachCourseSchema as any), asyncHandler(campaignController.attachCourse));
router.delete('/:id/courses/:courseId', asyncHandler(campaignController.removeCourse));

router.post('/:id/groups', validate(assignGroupSchema as any), asyncHandler(campaignController.assignGroup));
router.delete('/:id/groups/:groupId', asyncHandler(campaignController.unassignGroup));

router.post('/:id/users', validate(assignUserSchema as any), asyncHandler(campaignController.assignUser));
router.delete('/:id/users/:userId', asyncHandler(campaignController.unassignUser));

export default router;

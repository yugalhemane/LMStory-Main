import { Router } from 'express';
import { LearnerController } from '../controller/learner.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { updateLearnerProgressSchema } from '../validation/learner.validation';

const router = Router();
const learnerController = new LearnerController();

// Restrict to Auth only (Learner access, no requireTenantAdmin)
router.use(requireAuth);

router.get('/dashboard', asyncHandler(learnerController.getDashboard));
router.get('/enrollments/:enrollmentId', asyncHandler(learnerController.getEnrollmentDetails));
router.patch('/progress/:progressId', validate(updateLearnerProgressSchema as any), asyncHandler(learnerController.updateProgress));

// V1.1 Explicit Events & Playback
router.post('/progress/:progressId/view', asyncHandler(learnerController.markViewed));
router.post('/progress/:progressId/complete', asyncHandler(learnerController.markCompleted));
router.get('/progress/:progressId/playback', asyncHandler(learnerController.getPlaybackUrl));

export default router;

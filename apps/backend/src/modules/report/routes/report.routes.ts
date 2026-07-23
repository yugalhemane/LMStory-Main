import { Router } from 'express';
import { ReportController } from '../controller/report.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { userReportQuerySchema, certificateReportQuerySchema } from '../validation/report.validation';

const router = Router();
const reportController = new ReportController();

// ==========================================
// TENANT ADMIN ONLY REPORTING ROUTES
// ==========================================
// Reports module is strictly bound to Tenant Admins.
router.use(requireAuth, requireTenantAdmin);

router.get('/dashboard', asyncHandler(reportController.getDashboardSummary));
router.get('/users', validate(userReportQuerySchema as any), asyncHandler(reportController.getUsersReport));
router.get('/courses', asyncHandler(reportController.getCoursesReport));
router.get('/campaigns', asyncHandler(reportController.getCampaignsReport));
router.get('/groups', asyncHandler(reportController.getGroupsReport));
router.get('/learners/:userId', asyncHandler(reportController.getLearnerReport));
router.get('/certificates', validate(certificateReportQuerySchema as any), asyncHandler(reportController.getCertificatesReport));

export default router;

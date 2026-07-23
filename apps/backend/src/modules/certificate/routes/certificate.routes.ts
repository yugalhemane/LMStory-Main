import { Router } from 'express';
import { CertificateController } from '../controller/certificate.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { revokeCertificateSchema } from '../validation/certificate.validation';

const router = Router();
const certificateController = new CertificateController();

// ==========================================
// PUBLIC VERIFICATION ENDPOINT
// ==========================================
// Accessible globally without authentication. Returns sanitized data only.
router.get('/public/verify/:token', asyncHandler(certificateController.verifyPublicToken));

// ==========================================
// LEARNER PORTAL ENDPOINTS
// ==========================================
// Accessible by standard authenticated users (Learners)
router.get('/my', requireAuth, asyncHandler(certificateController.getMyCertificates));

// ==========================================
// TENANT ADMIN ENDPOINTS
// ==========================================
// Accessible strictly by Admins. Used for manual issuance and revocation.
router.use(requireAuth, requireTenantAdmin);

router.post('/issue/:enrollmentId', asyncHandler(certificateController.issueCertificate));
router.post('/:id/revoke', validate(revokeCertificateSchema as any), asyncHandler(certificateController.revokeCertificate));

export default router;

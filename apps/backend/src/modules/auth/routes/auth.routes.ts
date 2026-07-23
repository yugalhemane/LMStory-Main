import { Router } from 'express';
import { AuthController } from '../controller/auth.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../middleware/auth.middleware';
import { authRateLimiter, strictRateLimiter, resendVerificationLimiter } from '../../../shared/middlewares/rateLimiter.middleware';
import {
  registerTrialSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema,
  resendVerificationSchema,
  inviteUserSchema,
  acceptInvitationSchema,
  validateLicenseSchema
} from '../validation/auth.validation';

const router = Router();
const authController = new AuthController();

// Trial Registration
router.post('/register-trial', validate(registerTrialSchema as any), asyncHandler(authController.registerTrial));

// Verify Email
router.post('/verify', validate(emailVerificationSchema as any), asyncHandler(authController.verifyEmail));
router.post('/resend-verification', resendVerificationLimiter, validate(resendVerificationSchema as any), asyncHandler(authController.resendVerification));

// Login & Session
router.post('/login', authRateLimiter, validate(loginSchema as any), asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/refresh-token', asyncHandler(authController.refresh));

// Invitations
router.post('/invitations', requireAuth, validate(inviteUserSchema as any), asyncHandler(authController.inviteUser));
router.post('/accept-invitation', validate(acceptInvitationSchema as any), asyncHandler(authController.acceptInvitation));

// Password Management
router.post('/forgot-password', strictRateLimiter, validate(forgotPasswordSchema as any), asyncHandler(authController.forgotPassword));
router.post('/reset-password', strictRateLimiter, validate(resetPasswordSchema as any), asyncHandler(authController.resetPassword));

// Enterprise Mode
router.post('/license/validate', validate(validateLicenseSchema as any), asyncHandler(authController.validateLicense));
router.post('/setup', asyncHandler(authController.setupEnterprise));

export default router;

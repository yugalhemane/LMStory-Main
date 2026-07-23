import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  emailVerificationSchema,
  resendVerificationSchema,
} from '../validation/auth.validation';

export type RegisterDto = z.infer<typeof registerSchema>['body'];
export type LoginDto = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>['body'];
export type EmailVerificationDto = z.infer<typeof emailVerificationSchema>['body'];
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>['body'];

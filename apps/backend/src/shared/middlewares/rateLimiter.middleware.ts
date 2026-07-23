import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../responses/ApiResponse';

const createRateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs, // Time frame
    max: maxRequests, // Limit each IP to max requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (_req, res) => {
      res.status(429).json(
        ApiResponse.failure('Too many requests, please try again later.')
      );
    }
  });
};

// General Auth Limiter: e.g., 50 requests per 15 minutes
export const authRateLimiter = createRateLimiter(
  parseInt(process.env.AUTH_RATE_LIMIT_MAX || '50'),
  parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
);

// Strict Limiter for sensitive actions like password reset: e.g., 5 requests per 15 minutes
export const strictRateLimiter = createRateLimiter(
  parseInt(process.env.STRICT_RATE_LIMIT_MAX || '5'),
  parseInt(process.env.STRICT_RATE_LIMIT_WINDOW_MS || '900000')
);

// Resend Verification Limiter: e.g., 2 requests per minute to prevent spam
export const resendVerificationLimiter = createRateLimiter(
  parseInt(process.env.RESEND_VERIFICATION_LIMIT_MAX || '2'),
  parseInt(process.env.RESEND_VERIFICATION_WINDOW_MS || '60000')
);

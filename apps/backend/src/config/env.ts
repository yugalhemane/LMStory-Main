import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env relative to the current working directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  COOKIE_SECRET: z.string().min(1),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  STORAGE_PROVIDER: z.enum(['s3', 'mock']).default('mock'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production' && data.STORAGE_PROVIDER === 'mock') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "STORAGE_PROVIDER=mock is not allowed in production",
      path: ['STORAGE_PROVIDER'],
    });
  }
  if (data.STORAGE_PROVIDER === 's3') {
    if (!data.S3_BUCKET) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "S3_BUCKET is required", path: ['S3_BUCKET'] });
    if (!data.S3_REGION) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "S3_REGION is required", path: ['S3_REGION'] });
    if (!data.S3_ACCESS_KEY_ID) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "S3_ACCESS_KEY_ID is required", path: ['S3_ACCESS_KEY_ID'] });
    if (!data.S3_SECRET_ACCESS_KEY) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "S3_SECRET_ACCESS_KEY is required", path: ['S3_SECRET_ACCESS_KEY'] });
  }
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:\n', _env.error.format());
  process.exit(1);
}

export const env = _env.data;

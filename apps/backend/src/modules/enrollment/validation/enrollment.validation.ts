import { z } from 'zod';
import { EnrollmentStatus } from '@prisma/client';

export const createEnrollmentSchema = z.object({
  body: z.object({
    campaignId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

export const bulkEnrollmentSchema = z.object({
  body: z.object({
    campaignId: z.string().uuid(),
    userIds: z.array(z.string().uuid()).min(1).max(200),
  }),
});

export const listEnrollmentsSchema = z.object({
  query: z.object({
    campaignId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    status: z.nativeEnum(EnrollmentStatus).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1 as any),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10 as any),
  }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    status: z.nativeEnum(EnrollmentStatus),
    score: z.number().min(0).max(100).optional(),
    timeSpentSeconds: z.number().int().min(0).optional(),
  }),
});

import { z } from 'zod';
import { EnrollmentStatus } from '@prisma/client';

export const updateLearnerProgressSchema = z.object({
  body: z.object({
    status: z.nativeEnum(EnrollmentStatus),
    score: z.number().min(0).max(100).optional(),
    timeSpentSeconds: z.number().int().min(0).optional(),
    resumePosition: z.string().optional(),
  }),
});

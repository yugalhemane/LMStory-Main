import { z } from 'zod';
import { CampaignStatus } from '@prisma/client';

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(200),
    description: z.string().optional(),
    timezone: z.string().default('UTC'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    enrollmentWindowStart: z.string().datetime().optional(),
    enrollmentWindowEnd: z.string().datetime().optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, { message: 'startDate must be before or equal to endDate', path: ['startDate'] })
  .refine((data) => {
    if (data.enrollmentWindowStart && data.enrollmentWindowEnd) {
      return new Date(data.enrollmentWindowStart) <= new Date(data.enrollmentWindowEnd);
    }
    return true;
  }, { message: 'enrollmentWindowStart must be before or equal to enrollmentWindowEnd', path: ['enrollmentWindowStart'] })
  .refine((data) => {
    if (data.enrollmentWindowEnd && data.endDate) {
      return new Date(data.enrollmentWindowEnd) <= new Date(data.endDate);
    }
    return true;
  }, { message: 'enrollmentWindowEnd must be before or equal to endDate', path: ['enrollmentWindowEnd'] }),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    timezone: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    enrollmentWindowStart: z.string().datetime().optional(),
    enrollmentWindowEnd: z.string().datetime().optional(),
  }),
});

export const listCampaignsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.nativeEnum(CampaignStatus).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1 as any),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10 as any),
  }),
});

export const attachCourseSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
  }),
});

export const assignGroupSchema = z.object({
  body: z.object({
    groupId: z.string().uuid(),
  }),
});

export const assignUserSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
  }),
});

import { z } from 'zod';
import { AccountStatus, CertificateStatus } from '@prisma/client';

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1' as any),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10' as any),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const userReportQuerySchema = z.object({
  query: paginationSchema.extend({
    department: z.string().optional(),
    designation: z.string().optional(),
    status: z.nativeEnum(AccountStatus).optional(),
    joinedAfter: z.string().datetime().optional(),
    joinedBefore: z.string().datetime().optional(),
  })
});

export const certificateReportQuerySchema = z.object({
  query: paginationSchema.extend({
    status: z.nativeEnum(CertificateStatus).optional(),
    issuedAfter: z.string().datetime().optional(),
    issuedBefore: z.string().datetime().optional(),
    courseId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
    learnerId: z.string().uuid().optional(),
  })
});

export const standardReportQuerySchema = z.object({
  query: paginationSchema
});

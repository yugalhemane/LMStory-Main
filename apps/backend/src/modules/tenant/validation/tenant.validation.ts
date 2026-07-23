import { z } from 'zod';
import { TenantStatus } from '@prisma/client';

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    domain: z.string().optional(),
    industry: z.string().optional(),
    subscriptionPlanId: z.string().optional(),
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    domain: z.string().optional(),
    logo: z.string().optional(),
    industry: z.string().optional(),
    status: z.nativeEnum(TenantStatus).optional(),
    subscriptionPlanId: z.string().optional(),
  }),
});

import { z } from 'zod';

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').max(100),
    code: z.string().min(2, 'Code is required').max(50),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid HEX color format').optional(),
    type: z.enum(['STATIC', 'DYNAMIC', 'SYSTEM']).optional().default('STATIC'),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid HEX color format').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listGroupsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    type: z.enum(['STATIC', 'DYNAMIC', 'SYSTEM']).optional(),
    isActive: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1 as any),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10 as any),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid User ID format'),
  }),
});

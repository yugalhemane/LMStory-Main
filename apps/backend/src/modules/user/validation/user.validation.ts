import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    employeeId: z.string().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    employeeId: z.string().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    profileImage: z.string().optional(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    department: z.string().optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1 as any),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10 as any),
  }),
});

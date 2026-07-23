import { Role } from '@prisma/client';
import { requireRole } from './requireRole';

export const requireSuperAdmin = requireRole(Role.SUPER_ADMIN);

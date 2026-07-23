import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../errors';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    // 1. Missing authentication
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    
    // 2. Missing role claim
    if (!user.role) {
      throw new ForbiddenError('Missing authorization claim. Please log in again.');
    }
    
    // 3. Wrong/Insufficient role
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError('Insufficient privileges');
    }
    
    // 4. Correct privileged role
    next();
  };
};

export const requireTenantAdmin = requireRole(Role.TENANT_ADMIN);
export const requireSuperAdmin = requireRole(Role.SUPER_ADMIN);
export const requireTenantAdminOrSuperAdmin = requireRole(Role.TENANT_ADMIN, Role.SUPER_ADMIN);

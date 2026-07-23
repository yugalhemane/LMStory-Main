import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, Role } from '../store/auth.store';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuthStore();

  // If no roles specified, allow everyone
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Frontend role filtering is UX-only. Backend authorization is the security boundary.
  if (user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

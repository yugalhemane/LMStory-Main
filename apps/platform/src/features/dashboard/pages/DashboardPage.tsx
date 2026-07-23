import { useAuthStore } from '../../../store/auth.store';
import { TenantAdminDashboardPage } from './TenantAdminDashboardPage';
import { LearnerDashboardPage } from '../../learner/pages/LearnerDashboardPage';
import { Navigate } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'TENANT_ADMIN':
      return <TenantAdminDashboardPage />;
    case 'LEARNER':
      return <LearnerDashboardPage />;
    case 'TRAINER':
      return <div className="p-8">Trainer Dashboard Not Implemented</div>;
    case 'SUPER_ADMIN':
      return <Navigate to="/super-admin" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

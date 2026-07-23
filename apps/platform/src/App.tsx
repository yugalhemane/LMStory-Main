import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthLayout } from './features/auth/components/AuthLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { ActivateAccountPage } from './features/auth/pages/ActivateAccountPage';
import { EmailVerificationPage } from './features/auth/pages/EmailVerificationPage';
import { SessionExpiredPage } from './features/auth/pages/SessionExpiredPage';
import { AppShell } from './features/navigation/components/AppShell';
import { RequireAuth } from './guards/RequireAuth';
import { TenantProvider } from './providers/TenantProvider';
import { useAuthStore } from './store/auth.store';
import { LearnerPlayerPage } from './features/learner/pages/LearnerPlayerPage';
import { SuperAdminDashboardPage } from './features/super-admin/pages/SuperAdminDashboardPage';
import { TenantListPage } from './features/super-admin/pages/TenantListPage';
import { TenantCreatePage } from './features/super-admin/pages/TenantCreatePage';
import { TenantDetailPage } from './features/super-admin/pages/TenantDetailPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { InteractiveQuizPage } from './features/learner/pages/InteractiveQuizPage';
import { RoleGuard } from './guards/RoleGuard';

import { DashboardPage } from './features/dashboard';
import { UsersPage } from './features/users';
import { CourseListPage, CourseBuilderPage } from './features/courses';
import { TenantLibraryPage } from './features/library';
import { GroupListPage, GroupDetailPage } from './features/groups';
import { CampaignListPage, CampaignWizardPage, CampaignDetailPage } from './features/campaigns';
import { CourseReportsPage, UserReportsPage } from './features/reports';
import { LearnerCertificatesPage, PublicVerifyCertificatePage } from './features/certificates';
import { LearnerNotificationsPage, NotificationPreferencesPage, NotificationTemplatesPage } from './features/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { checkSession } = useAuthStore();
  const sessionChecked = useRef(false);

  useEffect(() => {
    if (!sessionChecked.current) {
      sessionChecked.current = true;
      checkSession();
    }
  }, [checkSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TenantProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Public Routes */}
            <Route path="/verify-certificate/:token" element={<PublicVerifyCertificatePage />} />
            
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/activate-account" element={<ActivateAccountPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/session-expired" element={<SessionExpiredPage />} />
            </Route>
            
            {/* Protected App Routes */}
            <Route element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/player/:enrollmentId" element={<RoleGuard allowedRoles={['LEARNER']}><LearnerPlayerPage /></RoleGuard>} />
              <Route path="/quiz/:quizId" element={<RoleGuard allowedRoles={['LEARNER']}><InteractiveQuizPage /></RoleGuard>} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/library" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><TenantLibraryPage /></RoleGuard>} />
              <Route path="/courses" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><CourseListPage /></RoleGuard>} />
              <Route path="/courses/:id" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><CourseBuilderPage /></RoleGuard>} />
              <Route path="/groups" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><GroupListPage /></RoleGuard>} />
              <Route path="/groups/:id" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><GroupDetailPage /></RoleGuard>} />
              <Route path="/campaigns" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><CampaignListPage /></RoleGuard>} />
              <Route path="/campaigns/new" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><CampaignWizardPage /></RoleGuard>} />
              <Route path="/campaigns/:id" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><CampaignDetailPage /></RoleGuard>} />
              <Route path="/reports/courses" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><CourseReportsPage /></RoleGuard>} />
              <Route path="/reports/users" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><UserReportsPage /></RoleGuard>} />
              <Route path="/my-certificates" element={<LearnerCertificatesPage />} />
              <Route path="/notifications" element={<LearnerNotificationsPage />} />
              <Route path="/notifications/preferences" element={<NotificationPreferencesPage />} />
              <Route path="/admin/notifications/templates" element={<RoleGuard allowedRoles={['TENANT_ADMIN']}><NotificationTemplatesPage /></RoleGuard>} />
              <Route path="/settings" element={<RoleGuard allowedRoles={['TENANT_ADMIN', 'SUPER_ADMIN']}><SettingsPage /></RoleGuard>} />
              
              {/* Super Admin Routes */}
              <Route path="/super-admin" element={<RoleGuard allowedRoles={['SUPER_ADMIN']}><SuperAdminDashboardPage /></RoleGuard>} />
              <Route path="/super-admin/tenants" element={<RoleGuard allowedRoles={['SUPER_ADMIN']}><TenantListPage /></RoleGuard>} />
              <Route path="/super-admin/tenants/new" element={<RoleGuard allowedRoles={['SUPER_ADMIN']}><TenantCreatePage /></RoleGuard>} />
              <Route path="/super-admin/tenants/:id" element={<RoleGuard allowedRoles={['SUPER_ADMIN']}><TenantDetailPage /></RoleGuard>} />
            </Route>
            
            {/* Fallback for other modules later */}
            <Route path="*" element={<div>Module Not Implemented</div>} />
          </Routes>
        </TenantProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

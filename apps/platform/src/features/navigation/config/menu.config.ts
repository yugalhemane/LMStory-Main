import { BookOpen, GraduationCap, LayoutDashboard, Settings, Users, Building2 } from 'lucide-react';
import { Role } from '../../../store/auth.store';

export type NavItem = {
  label: string;
  path: string;
  icon: any;
  roles?: Role[];
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Tenants',
    path: '/super-admin/tenants',
    icon: Building2,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Users',
    path: '/users',
    icon: Users,
    roles: ['TENANT_ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Groups',
    path: '/groups',
    icon: Users,
    roles: ['TENANT_ADMIN'],
  },
  {
    label: 'Campaigns',
    path: '/campaigns',
    icon: GraduationCap,
    roles: ['TENANT_ADMIN'],
  },
  {
    label: 'Library',
    path: '/library',
    icon: BookOpen,
    roles: ['TENANT_ADMIN'],
  },
  {
    label: 'Courses',
    path: '/courses',
    icon: GraduationCap,
    roles: ['TENANT_ADMIN'],
  },
  {
    label: 'Notifications',
    path: '/admin/notifications/templates',
    icon: Settings,
    roles: ['TENANT_ADMIN'],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['TENANT_ADMIN'],
  },
];

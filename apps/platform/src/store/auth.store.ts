import { create } from 'zustand';
import { authApi, setAccessToken } from 'api';

export type Role = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TRAINER' | 'LEARNER';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  tenantId?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },
  clearAuth: () => {
    setAccessToken(null);
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignored during logout
    } finally {
      setAccessToken(null);
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },
  checkSession: async () => {
    try {
      const result = await authApi.refresh();
      if (result?.data?.accessToken) {
        setAccessToken(result.data.accessToken);
        // Here we ideally need user object too. Since the backend /refresh doesn't return user,
        // we might need to call me().
        const userResult = await authApi.me();
        set({ user: userResult?.data, accessToken: result.data.accessToken, isAuthenticated: true, isLoading: false });
      } else {
        setAccessToken(null);
        set({ isLoading: false });
      }
    } catch (error) {
      setAccessToken(null);
      set({ isLoading: false });
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
}));

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from 'api';
import { useAuthStore } from '../../../store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null);
      const res = await authApi.login(data);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.accessToken);
      } else {
        setServerError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    // Apply body classes required by Stitch for this specific layout if it's the root layout,
    // though typically this is handled in an App or Auth layout wrapper.
    // For exact parity, we'll ensure the main element holds the core styling.
  }, []);

  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop w-full relative">
      {/* White-label Background Element (Full Screen) */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="w-full h-full object-cover opacity-20 filter blur-sm"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnMn7iOeWl8WH91ITSQDd9ypPMOLoP_6nBfvnXU6mtOw4WKhlSQ4qrOKK-vQY7QPUkM0tSEtDiImUpEXydeuBQFRJl9WujvAdSiCAAutn1E7W4Yjz3a1r3JSevNtUc8V1yBb1Kg8KE5Y-SMvA06RPG4WkwCc6iGVBPsdIArDxAeWh3eOzdDsMP8SNywlq0GoQgocZdcHUUzpGTaIgXgF3AtaJeLJMtdyQ5ZXDZ8nbCn42yoK2RLGMII9nRsJyZc3pMNs8Fi9eAd6Rr')",
          }}
        ></div>
      </div>

      {/* Login Container */}
      <main className="w-full max-w-[420px] z-10">
        {/* Brand Identity Header */}
        <div className="flex flex-col items-center mb-lg">
          <div className="flex items-center gap-sm mb-xs">
            <span
              className="material-symbols-outlined text-secondary text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
            <h1 className="text-on-surface font-display text-display tracking-tight">LMStory</h1>
          </div>
          <p className="text-on-surface-variant font-body-md text-body-md">
            Enterprise Learning Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-stitch-xl p-xl login-card">
          <div className="mb-lg">
            <h2 className="text-on-surface font-headline-lg text-headline-lg mb-xs">Welcome back</h2>
            <p className="text-on-surface-variant font-body-sm text-body-sm">
              Please enter your credentials to access your portal.
            </p>
          </div>

          {serverError && (
            <div className="mb-lg p-sm bg-error-container text-on-error-container rounded-stitch-lg font-body-sm text-body-sm">
              {serverError}
            </div>
          )}

          <form className="space-y-md" id="login-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Tenant Selection (White-label feature) */}
            <div className="space-y-xs">
              <label className="text-on-surface font-label-md text-label-md" htmlFor="tenant">
                Organization
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 pl-md pr-xl appearance-none bg-surface border border-outline-variant rounded-stitch-lg font-body-md text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                  id="tenant"
                >
                  <option value="acme">Acme Corporation</option>
                  <option value="global">Global Industries</option>
                  <option value="tech">TechNova Solutions</option>
                </select>
                <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-xs">
              <label className="text-on-surface font-label-md text-label-md" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  className="w-full h-11 pl-11 pr-md bg-surface border border-outline-variant rounded-stitch-lg font-body-md text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label className="text-on-surface font-label-md text-label-md" htmlFor="password">
                  Password
                </label>
                <a className="text-secondary font-label-md text-label-md hover:underline" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  className="w-full h-11 pl-11 pr-11 bg-surface border border-outline-variant rounded-stitch-lg font-body-md text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-outline"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                />
                <button
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Policy */}
            <div className="flex items-center gap-sm">
              <input
                className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary"
                id="remember"
                type="checkbox"
              />
              <label
                className="text-on-surface-variant font-body-sm text-body-sm cursor-pointer select-none"
                htmlFor="remember"
              >
                Remember me on this device
              </label>
            </div>

            {/* Action Button */}
            <button
              className="w-full h-12 bg-secondary text-on-secondary font-title-md text-title-md rounded-stitch-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-sm disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
              {!isSubmitting && (
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              )}
            </button>
          </form>

          {/* SSO / Third Party */}
          <div className="mt-lg relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-label-md">
              <span className="bg-surface-container-lowest px-md text-on-surface-variant font-label-md">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-md grid grid-cols-2 gap-sm">
            <button className="flex items-center justify-center gap-sm h-11 border border-outline-variant rounded-stitch-lg hover:bg-surface-container-low transition-colors font-body-sm text-on-surface">
              <img
                alt="Google"
                className="w-4 h-4"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBagTlnDJW0GCqZ7jWYzbeGiSmLQeFDBz4Q_QjkyKWUA_qd0Y-jxGdFYLRNP05-wfEp6iZIdAVd-1ynwrl9PV-jAx9J-X85xG6-OiQBGUlMMy2490tUbMmCOxXA0CD6wulkAv2RPyhB8rkv9qPUD1mke9s0meoHz7u5pST40vmRwZ8Rb0aKoyLWjdUo_iK-6EhkMIn2uKtO3m-mM9b-BPy9BDrk0fc6i4jCMHiFHZQ1jgSh9ETH6S1p2qUyD73cGOUMCVe3KzBFikX1"
              />
              Google
            </button>
            <button className="flex items-center justify-center gap-sm h-11 border border-outline-variant rounded-stitch-lg hover:bg-surface-container-low transition-colors font-body-sm text-on-surface">
              <span
                className="material-symbols-outlined text-[18px] text-[#0078d4]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                grid_view
              </span>
              Microsoft
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-lg text-center space-y-sm pb-8">
          <p className="text-on-surface-variant font-body-sm text-body-sm">
            Don't have an account?{' '}
            <a className="text-secondary font-title-md hover:underline" href="/trial">
              Create an account
            </a>
          </p>
          <div className="flex justify-center gap-md text-label-sm text-outline items-center">
            <a className="hover:text-on-surface-variant transition-colors" href="#">
              Privacy Policy
            </a>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <a className="hover:text-on-surface-variant transition-colors" href="#">
              Terms of Service
            </a>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <a className="hover:text-on-surface-variant transition-colors" href="#">
              Support
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

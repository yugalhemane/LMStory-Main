'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from 'api';
import { Loader2, CheckCircle2, Building2, User, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const trialSchema = z.object({
  tenantName: z.string().min(2, 'Company Name is required'),
  firstName: z.string().min(2, 'First Name is required'),
  lastName: z.string().min(2, 'Last Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type TrialFormValues = z.infer<typeof trialSchema>;

export default function TrialRegistrationPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrialFormValues>({
    resolver: zodResolver(trialSchema),
  });

  const onSubmit = async (data: TrialFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await authApi.registerTrial(data);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('trial_email', data.email);
      }
      router.push('/trial/verify-email');
    } catch (err: any) {
      if (err.data?.message) {
        setServerError(err.data.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 bg-gray-800/60 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
            Start your free trial
          </h2>
          <p className="mt-4 text-center text-sm text-gray-400">
            No credit card required. Setup your LMStory workspace in seconds.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-destructive/10 border border-destructive/50 text-destructive-foreground p-4 rounded-lg text-sm text-center"
          >
            {serverError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="tenantName" className="block text-sm font-medium text-gray-300 mb-1">
                Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="tenantName"
                  aria-invalid={!!errors.tenantName}
                  {...register('tenantName')}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Acme Corp"
                />
              </div>
              {errors.tenantName && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-1 text-sm text-destructive-foreground"
                >
                  {errors.tenantName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="firstName"
                    aria-invalid={!!errors.firstName}
                    {...register('firstName')}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Jane"
                  />
                </div>
                {errors.firstName && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="mt-1 text-sm text-destructive-foreground"
                  >
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="lastName"
                    aria-invalid={!!errors.lastName}
                    {...register('lastName')}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="mt-1 text-sm text-destructive-foreground"
                  >
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="jane@acme.com"
                />
              </div>
              {errors.email && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-1 text-sm text-destructive-foreground"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                  type="password"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-1 text-sm text-destructive-foreground"
                >
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Create Workspace{' '}
                  <CheckCircle2 className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </span>
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

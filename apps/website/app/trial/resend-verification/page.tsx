'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from 'api';
import { Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResendFormValues = z.infer<typeof resendSchema>;

export default function ResendVerificationPage() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('trial_email');
      if (storedEmail) {
        setValue('email', storedEmail);
      }
    }
  }, [setValue]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data: ResendFormValues) => {
    if (countdown > 0) return; // Prevent spam

    setIsSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      await authApi.resendVerification(data);
      setSuccess(true);
      setCountdown(60); // 60s rate limit
    } catch (err: any) {
      if (err.response?.status === 429) {
        setServerError('Too many requests. Please wait a minute before trying again.');
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
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
        <Link
          href="/trial"
          className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Registration
        </Link>

        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Resend Email</h2>
          <p className="mt-2 text-sm text-gray-400">
            If you didn't receive the verification email, you can request a new one below. You can
            also correct your email address if it was misspelled.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-destructive/10 border border-destructive/50 text-destructive-foreground p-4 rounded-lg text-sm"
          >
            {serverError}
          </div>
        )}

        {success && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg text-sm flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>If an account exists for this email, a new verification link has been sent.</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
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
                disabled={countdown > 0}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
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
            <button
              type="submit"
              disabled={isSubmitting || countdown > 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : countdown > 0 ? (
                `Wait ${countdown}s to resend`
              ) : (
                'Send Verification Link'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

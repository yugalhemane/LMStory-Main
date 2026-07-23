'use client';

import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('trial_email');
      if (storedEmail) {
        setEmail(storedEmail);
      }
      setHasCheckedSession(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 bg-gray-800/60 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
          <Mail className="h-8 w-8 text-primary" />
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Check your inbox</h2>
          {hasCheckedSession && email ? (
            <p className="mt-4 text-sm text-gray-300">
              We've sent a verification link to <br />
              <span className="font-semibold text-white text-base mt-1 inline-block">{email}</span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-300">
              We've sent a verification link to your email address.
            </p>
          )}
          <p className="mt-4 text-sm text-gray-400">
            Click the link in the email to activate your workspace and start your free trial.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Didn't receive an email?{' '}
            <Link
              href="/trial/resend-verification"
              className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
            >
              Resend it <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

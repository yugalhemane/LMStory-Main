'use client';

import { authApi } from 'api';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';

export default function VerifyEmailGatewayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ALREADY_VERIFIED' | 'ERROR'>(
    'LOADING',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const verifyAttempted = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('ERROR');
      setErrorMessage('Verification token is missing from the URL.');
      return;
    }

    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verify = async () => {
      try {
        await authApi.verifyEmail({ token });
        setStatus('SUCCESS');
      } catch (err: any) {
        if (err.data?.message === 'ALREADY_VERIFIED') {
          setStatus('ALREADY_VERIFIED');
        } else {
          setStatus('ERROR');
          if (err.data?.message) {
            setErrorMessage(err.data.message);
          } else {
            setErrorMessage('This verification link is invalid or has expired.');
          }
        }
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative z-10 bg-gray-800/60 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-2xl text-center">
        {status === 'LOADING' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white">Verifying your email...</h2>
            <p className="mt-2 text-gray-400">Please wait while we activate your workspace.</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/10">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Verified!</h2>
            <p className="mt-4 text-gray-300">
              Your email has been verified successfully. Your LMStory workspace is now active.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="mt-8 w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              Continue to Login <ArrowRight className="w-4 h-4" />
            </button>
            <p className="mt-4 text-xs text-gray-500">
              (Auto-login will be supported here in the future)
            </p>
          </div>
        )}

        {status === 'ALREADY_VERIFIED' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/10">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Already Verified!</h2>
            <p className="mt-4 text-gray-300">
              Your email has already been verified. You can continue to sign in to your workspace.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="mt-8 w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              Go to Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-500/10">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="mt-4 text-gray-300">{errorMessage}</p>

            <button
              onClick={() => router.push('/trial/resend-verification')}
              className="mt-8 w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-semibold rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition-all"
            >
              Request a new link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

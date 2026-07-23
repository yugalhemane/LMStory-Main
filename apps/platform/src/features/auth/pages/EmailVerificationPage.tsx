import { useState, useEffect, useRef } from 'react';
import { Button } from 'ui';
import { Alert, AlertDescription } from 'ui';
import { authApi } from 'api';
import { School, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export function EmailVerificationPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'invalid' | 'error'>('verifying');
  const [serverMessage, setServerMessage] = useState<string>('');
  const hasVerified = useRef(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setServerMessage('No verification token provided.');
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        // BACKEND GAP/PARTIALLY AVAILABLE: The backend /api/auth/verify-email endpoint exists but is mocked.
        const res = await authApi.verifyEmail({ token });
        if (res.success) {
          setStatus('success');
          setServerMessage(res.message || 'Email verified successfully.');
        } else {
          setStatus('invalid');
          setServerMessage(res.message || 'The verification link is invalid or expired.');
        }
      } catch (err: any) {
        setStatus('error');
        setServerMessage(err.response?.data?.message || 'An error occurred while verifying your email.');
      }
    };

    verify();
  }, [token]);

  return (
    <main className="w-full max-w-[420px] z-10 relative">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-1">
          <School className="text-secondary w-10 h-10" />
          <h1 className="text-foreground font-bold text-4xl tracking-tight">LMStory</h1>
        </div>
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 bg-muted/50 text-muted-foreground rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-foreground font-semibold text-2xl mb-2">Verifying Email</h2>
            <p className="text-muted-foreground text-sm mb-4">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-foreground font-semibold text-2xl mb-2">Email Verified!</h2>
            <p className="text-muted-foreground text-sm mb-8">{serverMessage}</p>
            <Button className="w-full h-12" onClick={() => window.location.href = '/login'}>
              Continue to Login
            </Button>
          </>
        )}

        {(status === 'invalid' || status === 'error') && (
          <>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-foreground font-semibold text-2xl mb-2">Verification Failed</h2>
            <Alert variant="destructive" className="mb-8 text-left">
              <AlertDescription>{serverMessage}</AlertDescription>
            </Alert>
            <Button className="w-full h-12" onClick={() => window.location.href = '/login'}>
              Return to Login
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

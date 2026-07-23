import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'ui';
import { Input } from 'ui';
import { Label } from 'ui';
import { Alert, AlertDescription } from 'ui';
import { authApi } from 'api';
import { School, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      setServerMessage({ type: 'error', text: 'Reset token is missing or invalid.' });
      return;
    }
    
    try {
      setServerMessage(null);
      const res = await authApi.resetPassword({ token, newPassword: data.newPassword });
      if (res.success) {
        setServerMessage({ type: 'success', text: res.message || 'Password has been reset successfully. You can now login.' });
      } else {
        setServerMessage({ type: 'error', text: res.message || 'Failed to reset password' });
      }
    } catch (err: any) {
      setServerMessage({ type: 'error', text: err.response?.data?.message || 'An unexpected error occurred' });
    }
  };

  return (
    <main className="w-full max-w-[420px] z-10 relative">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-1">
          <School className="text-secondary w-10 h-10" />
          <h1 className="text-foreground font-bold text-4xl tracking-tight">LMStory</h1>
        </div>
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-foreground font-semibold text-2xl mb-1">Reset Password</h2>
          <p className="text-muted-foreground text-sm">Please enter your new password below.</p>
        </div>

        {serverMessage && (
          <Alert variant={serverMessage.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{serverMessage.text}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register('newPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 mt-2 gap-2" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>
        
        {serverMessage?.type === 'success' && (
          <div className="mt-6 text-center">
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

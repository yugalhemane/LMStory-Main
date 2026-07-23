import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'ui';
import { Input } from 'ui';
import { Label } from 'ui';
import { Alert, AlertDescription } from 'ui';
import { School, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
// import { authApi } from 'api';

// BACKEND GAP - PUBLIC TOKEN-BASED ACTIVATION NOT IMPLEMENTED
// This screen uses a scaffold boundary.

const activateAccountSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof activateAccountSchema>;

export function ActivateAccountPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(activateAccountSchema),
  });

  const onSubmit = async () => {
    try {
      setServerMessage(null);
      
      // MOCKED ADAPTER BOUNDARY
      // const res = await authApi.activateAccount({ token, password: data.password });
      const res = { success: false, message: 'Backend endpoint for public activation is not implemented.' };
      
      if (res.success) {
        setServerMessage({ type: 'success', text: 'Account activated successfully! You can now login.' });
      } else {
        setServerMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setServerMessage({ type: 'error', text: 'An unexpected error occurred' });
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
          <h2 className="text-foreground font-semibold text-2xl mb-1">Activate Account</h2>
          <p className="text-muted-foreground text-sm">Welcome! Please set a secure password to activate your account.</p>
        </div>

        {serverMessage && (
          <Alert variant={serverMessage.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{serverMessage.text}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="password">Set Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register('password')}
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
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
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
            {isSubmitting ? 'Activating...' : 'Activate Account'}
            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>
        
        {serverMessage?.type === 'success' && (
          <div className="mt-6 text-center">
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

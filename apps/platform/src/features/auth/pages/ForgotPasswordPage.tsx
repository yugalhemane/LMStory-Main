import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'ui';
import { Input } from 'ui';
import { Label } from 'ui';
import { Alert, AlertDescription } from 'ui';
import { authApi } from 'api';
import { School, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [serverMessage, setServerMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setServerMessage(null);
      const res = await authApi.forgotPassword(data);
      if (res.success) {
        setServerMessage({ type: 'success', text: res.message || 'Check your email for instructions.' });
      } else {
        setServerMessage({ type: 'error', text: res.message || 'Failed to request password reset' });
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
          <h2 className="text-foreground font-semibold text-2xl mb-1">Forgot Password</h2>
          <p className="text-muted-foreground text-sm">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {serverMessage && (
          <Alert variant={serverMessage.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{serverMessage.text}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 mt-2 gap-2" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="inline-flex items-center gap-1 text-secondary text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </a>
        </div>
      </div>
    </main>
  );
}

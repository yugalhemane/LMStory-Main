
import { Button } from 'ui';
import { School, ClockAlert } from 'lucide-react';

export function SessionExpiredPage() {
  return (
    <main className="w-full max-w-[420px] z-10 relative">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-1">
          <School className="text-secondary w-10 h-10" />
          <h1 className="text-foreground font-bold text-4xl tracking-tight">LMStory</h1>
        </div>
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <ClockAlert className="w-8 h-8" />
        </div>
        
        <h2 className="text-foreground font-semibold text-2xl mb-2">Session Expired</h2>
        <p className="text-muted-foreground text-sm mb-8">
          For your security, your session has timed out due to inactivity. Please log in again to continue.
        </p>

        <Button className="w-full h-12" onClick={() => window.location.href = '/login'}>
          Return to Login
        </Button>
      </div>
    </main>
  );
}

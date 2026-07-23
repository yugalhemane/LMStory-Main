import { AlertCircle } from 'lucide-react';
import { Button } from 'ui';
import { useNavigate } from 'react-router-dom';

export function InteractiveQuizPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">Backend Pending</h1>
      <p className="text-lg text-muted-foreground max-w-lg">
        The Interactive Quiz Engine is not yet supported in this version of the platform. This route is scaffolded for future implementation.
      </p>
      <div className="pt-4">
        <Button onClick={() => navigate(-1)} size="lg">
          Go Back
        </Button>
      </div>
    </div>
  );
}

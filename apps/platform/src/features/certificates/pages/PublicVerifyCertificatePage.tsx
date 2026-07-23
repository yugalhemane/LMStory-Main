import { useParams, Link } from 'react-router-dom';
import { useVerifyCertificate } from '../hooks/useCertificateQueries';
import { Button } from 'ui';
import { CheckCircle2, XCircle, Search, Info, Link as LinkIcon, Download, Award } from 'lucide-react';

export function PublicVerifyCertificatePage() {
  const { token } = useParams<{ token: string }>();
  const { data: certificate, isLoading, isError } = useVerifyCertificate(token || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center px-6">
          <div className="font-bold text-lg text-foreground">LMStory</div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  if (isError || !certificate || certificate.status === 'REVOKED') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center px-6">
          <div className="font-bold text-lg text-foreground">LMStory</div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Verification Failed</h1>
          <p className="text-muted-foreground max-w-md text-center mb-8">
            We could not verify this certificate. It may be invalid, revoked, or the link is incorrect.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link to="/">Return to Homepage</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-card flex items-center px-6">
        <div className="font-bold text-lg text-foreground">LMStory</div>
      </header>
      
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Certificate Verified</h1>
            <p className="text-lg text-muted-foreground">
              This credential is valid and recognized by the LMStory platform.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg p-6 md:p-10 flex flex-col md:flex-row gap-8">
            {/* Certificate Details */}
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Credential ID</p>
                  <p className="text-lg font-mono text-foreground bg-muted/50 p-2 rounded-md inline-block border border-border">
                    {certificate.certificateCode}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Issued To</p>
                    <p className="text-xl font-bold text-foreground">{certificate.user?.firstName} {certificate.user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Issuing Organization</p>
                    <p className="text-xl font-bold text-foreground">{certificate.tenant?.name || 'LMStory'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Issue Date</p>
                    <p className="text-lg text-foreground">
                      {new Date(certificate.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Expiration Date</p>
                    <p className="text-lg text-foreground">—</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border flex gap-4">
                <Button 
                  className="flex-1 h-12 text-base font-semibold shadow-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // Minimal UI feedback left out for brevity in React component
                  }}
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 cursor-not-allowed opacity-70" title="Coming Soon">
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Visual Side */}
            <div className="md:w-1/3 bg-secondary/5 rounded-xl border border-border p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              
              <Award className="w-20 h-20 text-secondary mb-4 relative z-10" />
              <div className="text-center relative z-10">
                <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-2">Certificate of Completion</p>
                <h3 className="font-serif text-xl font-bold text-foreground leading-tight mb-2">
                  {certificate.course?.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="w-full max-w-xl bg-card border border-border p-2 rounded-2xl flex items-center gap-3 shadow-sm opacity-70">
              <div className="pl-4 text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <input 
                className="flex-grow border-none focus:ring-0 text-foreground py-3 px-0 bg-transparent text-base" 
                placeholder="Verify another credential ID... (Coming Soon)" 
                type="text"
                disabled
              />
              <Button variant="secondary" className="px-6 py-5 rounded-xl cursor-not-allowed" disabled>
                Verify
              </Button>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4" />
              Public verification portal for the LMStory Enterprise ecosystem.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-border bg-card px-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">Powered by</span>
            <span className="font-bold text-foreground">LMStory</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 LMStory Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}

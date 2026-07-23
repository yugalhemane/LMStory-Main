import { useMyCertificates } from '../hooks/useCertificateQueries';
import { Button } from 'ui';
import { Award, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LearnerCertificatesPage() {
  const { data: certificates, isLoading, error } = useMyCertificates();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-4">My Certificates</h1>
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          Failed to load certificates.
        </div>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">My Certificates</h1>
        </div>
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Certificates Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You haven't earned any certificates. Complete a course to earn your first certification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-8 bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Certificates</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and verify your earned credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
            {/* Certificate Visual (Left side on desktop, top on mobile) */}
            <div className="md:w-2/5 bg-secondary/5 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border min-h-[200px] relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-xl"></div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
              
              <Award className="w-16 h-16 text-secondary mb-3 relative z-10" />
              <div className="text-center relative z-10">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Certificate of</p>
                <p className="font-serif text-lg font-bold text-foreground leading-tight">Completion</p>
              </div>
            </div>

            {/* Certificate Details (Right side on desktop, bottom on mobile) */}
            <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-foreground line-clamp-2">
                    {cert.course?.title || 'Unknown Course'}
                  </h3>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issued to</span>
                    <span className="font-medium text-foreground">{cert.user?.firstName} {cert.user?.lastName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issue Date</span>
                    <span className="font-medium text-foreground">
                      {new Date(cert.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credential ID</span>
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-foreground">
                      {cert.certificateCode.substring(0, 12)}...
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {cert.status === 'REVOKED' ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Revoked</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                      <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Verified</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 cursor-not-allowed opacity-70" title="Coming Soon">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="h-8 text-xs font-medium">
                    {/* The token is actually passed directly in public route, or we use a link */}
                    {/* The previous code didn't have a verify link in LearnerCertificatesPage, but Stitch has "Public Verification Page" */}
                    {/* If we don't have token, we can't link easily unless cert.id is the token or similar. */}
                    {/* We'll just link to the public verify if we have token, but we only have certificateCode here. */}
                    {/* Actually, useVerifyCertificate(token) takes the token. The backend verifies by token. */}
                    <Link to={`/verify-certificate/${cert.certificateCode}`} className="flex items-center gap-1.5">
                      Verify <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

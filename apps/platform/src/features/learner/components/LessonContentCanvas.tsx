import { AlertCircle, FileText } from 'lucide-react';
import { usePlaybackUrl } from '../api/learner.queries';

export interface LessonContentCanvasProps {
  progressId: string;
  title: string;
  description?: string;
  contentType: string;
  isCompleted: boolean;
  onComplete: () => void;
  isCompleting: boolean;
}

export function LessonContentCanvas({
  progressId,
  description,
  contentType
}: LessonContentCanvasProps) {
  
  const { data: playback, isLoading, error } = usePlaybackUrl(progressId);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="aspect-video w-full bg-slate-900 rounded-xl flex items-center justify-center border border-border">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (error || !playback || !playback.url) {
      return (
        <div className="aspect-video w-full bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-border p-8 text-center space-y-4 shadow-inner">
           <AlertCircle className="w-12 h-12 text-slate-500" />
           <h3 className="text-xl font-semibold text-slate-200">Media Source Unavailable</h3>
           <p className="text-slate-400 max-w-md">
             The content source for this lesson is missing or unsupported in the current platform version.
           </p>
        </div>
      );
    }

    if (contentType === 'VIDEO' || contentType === 'LINK') {
      return (
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-border">
          <video 
            src={playback.url} 
            controls 
            className="w-full h-full object-contain"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (contentType === 'PDF' || contentType === 'DOCUMENT') {
      return (
        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-border p-8 text-center space-y-4 min-h-[500px]">
           <FileText className="w-16 h-16 text-primary" />
           <h3 className="text-xl font-semibold text-foreground">Document Viewer</h3>
           <p className="text-muted-foreground max-w-md mb-4">
             This document has been opened for viewing.
           </p>
           <a 
             href={playback.url} 
             target="_blank" 
             rel="noopener noreferrer"
             className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
           >
             Open Document
           </a>
        </div>
      );
    }

    return (
      <div className="p-8 bg-muted rounded-xl border border-border flex flex-col items-center justify-center text-center min-h-[400px]">
         <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
         <h3 className="text-lg font-medium text-foreground">Unsupported Content Type</h3>
         <p className="text-muted-foreground mt-2">Cannot render {contentType}</p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto p-4 md:p-8 space-y-8 flex-1 flex flex-col">
      {renderContent()}

      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-foreground">Lesson Overview</h4>
        {description ? (
          <p className="text-muted-foreground max-w-3xl leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        ) : (
          <p className="text-muted-foreground italic">No description provided.</p>
        )}
      </div>
    </div>
  );
}

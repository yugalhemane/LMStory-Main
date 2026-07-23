import React, { useState } from 'react';
import { useTenantLibraryContentList } from '../../../hooks/useTenantLibrary';
import { Button, Card, EmptyState, Badge, Input } from 'ui';
import { Search, FolderOpen, DownloadCloud, AlertCircle, FileArchive, FileText, Image as ImageIcon, Video, MoreVertical, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/auth.store';
import { AssetUploadModal } from '../components/AssetUploadModal';

export const TenantLibraryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeLibraryItemId, setActiveLibraryItemId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { data: libraryData, isLoading } = useTenantLibraryContentList({ search });
  const { user } = useAuthStore();
  
  // Show blocked warning if SUPER_ADMIN tries to view tenant library or if TENANT_ADMIN expects global import
  const showImportBlocked = user?.role === 'TENANT_ADMIN' || user?.role === 'TRAINER';

  const getFileIcon = (title: string = '') => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.endsWith('.pdf')) return <FileText className="w-16 h-16 text-error" />;
    if (lowerTitle.endsWith('.zip')) return <FileArchive className="w-16 h-16 text-emerald-600" />;
    if (lowerTitle.endsWith('.mp4') || lowerTitle.endsWith('.mov')) return <Video className="w-16 h-16 text-blue-500" />;
    if (lowerTitle.endsWith('.png') || lowerTitle.endsWith('.jpg')) return <ImageIcon className="w-16 h-16 text-purple-500" />;
    return <FolderOpen className="w-16 h-16 text-muted-foreground opacity-50" />;
  };

  const getSmallIcon = (title: string = '') => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.endsWith('.pdf')) return <FileText className="w-3.5 h-3.5" />;
    if (lowerTitle.endsWith('.zip')) return <FileArchive className="w-3.5 h-3.5" />;
    if (lowerTitle.endsWith('.mp4') || lowerTitle.endsWith('.mov')) return <Video className="w-3.5 h-3.5" />;
    if (lowerTitle.endsWith('.png') || lowerTitle.endsWith('.jpg')) return <ImageIcon className="w-3.5 h-3.5" />;
    return <FolderOpen className="w-3.5 h-3.5" />;
  };

  const getBadge = (title: string = '') => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.endsWith('.pdf')) return <span className="absolute top-2 left-2 bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">PDF</span>;
    if (lowerTitle.endsWith('.zip')) return <span className="absolute top-2 left-2 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">SCORM 1.2</span>;
    return null;
  };

  return (
    <>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6 bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Content Library</h1>
            <p className="text-sm text-muted-foreground mt-1">View your tenant's imported content assets.</p>
          </div>
          <div className="flex gap-2">
            {showImportBlocked ? (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md text-sm border border-amber-200">
                <AlertCircle className="w-4 h-4" />
                <span>Import endpoint is available, but Tenant-side global content discovery is blocked by current API authorization contract. Global library requires SUPER_ADMIN role.</span>
              </div>
            ) : null}
            <Button disabled className="flex items-center gap-2" variant="outline">
              <DownloadCloud className="w-4 h-4" />
              Import from Global
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search library..." 
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !libraryData?.data.length && !search ? (
          <EmptyState
            title="Library is empty"
            description="Your tenant library does not have any content yet. Click Add New Asset to get started."
            icon={<FolderOpen className="w-12 h-12" />}
            action={
              <Button onClick={() => setIsUploadModalOpen(true)}>Add New Asset</Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Add New Asset Card */}
            <div 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-muted/30 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center min-h-[220px] hover:border-secondary hover:bg-muted/50 transition-all cursor-pointer group"
            >
              <PlusCircle className="w-12 h-12 text-muted-foreground group-hover:text-secondary mb-3" />
              <p className="text-base font-semibold text-muted-foreground group-hover:text-secondary">Add New Asset</p>
              <p className="text-xs text-muted-foreground opacity-70 mt-1">or drag and drop</p>
            </div>

            {/* Asset Cards */}
            {(libraryData?.data || []).map((item: any) => (
              <Card key={item.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:border-secondary hover:shadow-md transition-all cursor-pointer group">
                <div className="relative h-40 bg-muted flex items-center justify-center border-b border-border overflow-hidden">
                  {item.customThumbnail ? (
                    <img src={item.customThumbnail} alt={item.customTitle || 'Thumbnail'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
                      <div className="w-20 h-28 bg-white border border-border rounded-sm shadow-sm flex flex-col items-center justify-center">
                        {getFileIcon(item.customTitle)}
                      </div>
                    </div>
                  )}
                  {getBadge(item.customTitle)}
                  <div className="absolute top-2 right-2">
                    <Badge variant={item.customStatus === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                      {item.customStatus || 'IMPORTED'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="overflow-hidden pr-2">
                      <h3 className="font-semibold text-foreground text-sm truncate mb-1">
                        {item.customTitle || 'Untitled Content'}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {getSmallIcon(item.customTitle)}
                        <span>{item.fileSize || 'Unknown Size'}</span>
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0" onClick={(e: any) => { e.stopPropagation(); setActiveLibraryItemId(item.id); }}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AssetUploadModal 
        libraryItemId={activeLibraryItemId || ''} 
        isOpen={!!activeLibraryItemId || isUploadModalOpen} 
        onClose={() => { setActiveLibraryItemId(null); setIsUploadModalOpen(false); }} 
      />
    </>
  );
};

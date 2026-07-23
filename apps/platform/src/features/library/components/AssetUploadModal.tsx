import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'ui/components/overlays/Dialog';
import { Button, Input, Label } from 'ui';
import { Upload, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { tenantLibraryApi } from 'api';
import { useQueryClient } from '@tanstack/react-query';

interface AssetUploadModalProps {
  libraryItemId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AssetUploadModal: React.FC<AssetUploadModalProps> = ({ libraryItemId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Link state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Presign
      const presignRes = await tenantLibraryApi.presignUpload(libraryItemId, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // 2. Upload to S3
      const uploadRes = await fetch(presignRes.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // 3. Confirm
      await tenantLibraryApi.confirmUpload(libraryItemId, {
        objectKey: presignRes.objectKey,
        name: file.name,
      });

      setSuccessMsg('File uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['tenant-library'] });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateLink = async () => {
    if (!linkUrl || !linkName) {
      setErrorMsg('Please provide both URL and Name');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await tenantLibraryApi.createExternalLink(libraryItemId, {
        url: linkUrl,
        name: linkName
      });
      setSuccessMsg('External link added successfully!');
      setLinkUrl('');
      setLinkName('');
      queryClient.invalidateQueries({ queryKey: ['tenant-library'] });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUploading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Media Assets</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
          <button 
            className={`text-sm font-medium pb-2 -mb-[9px] border-b-2 transition-colors ${activeTab === 'upload' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload File
          </button>
          <button 
            className={`text-sm font-medium pb-2 -mb-[9px] border-b-2 transition-colors ${activeTab === 'link' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('link')}
          >
            External Link
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Select a file to upload</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">Supports MP4, WebM (Max 2GB), PDF (Max 50MB)</p>
              
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="video/mp4,video/webm,application/pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                variant="outline"
              >
                {isUploading ? 'Uploading...' : 'Browse Files'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>HTTPS URL</Label>
              <Input 
                placeholder="https://example.com/video.mp4" 
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label>Link Name</Label>
              <Input 
                placeholder="e.g. YouTube Video" 
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <Button 
              className="w-full flex items-center justify-center gap-2" 
              onClick={handleCreateLink}
              disabled={isUploading}
            >
              <LinkIcon className="w-4 h-4" />
              {isUploading ? 'Saving...' : 'Add External Link'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

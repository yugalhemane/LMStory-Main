import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'ui/components/overlays/Dialog';
import { Input, EmptyState, Badge } from 'ui';
import { Search, FolderOpen, Video, FileText } from 'lucide-react';
import { useTenantLibraryContentList } from '../../../hooks/useTenantLibrary';
import { useAddCourseItem } from '../../../hooks/useCourses';

interface ContentPickerModalProps {
  courseId: string;
  sectionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContentPickerModal: React.FC<ContentPickerModalProps> = ({ courseId, sectionId, isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const { data: libraryData, isLoading } = useTenantLibraryContentList({ search });
  const { mutate: addItem, isPending } = useAddCourseItem();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelect = (item: any) => {
    if (!sectionId) return;
    setErrorMsg(null);
    
    addItem(
      {
        courseId,
        sectionId,
        data: {
          tenantLibraryId: item.id,
          itemType: item.contentType,
          isMandatory: true,
          completionCriteria: 'VIEW',
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || 'Failed to add item');
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Content from Library</DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
            {errorMsg}
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search tenant library..." 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !libraryData?.data.length ? (
            <EmptyState
              title="No content found"
              description="No matching content found in your tenant library."
              icon={<FolderOpen className="w-8 h-8" />}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {libraryData.data.map((item: any) => (
                <div 
                  key={item.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer transition-colors"
                  onClick={() => !isPending && handleSelect(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      {item.contentType === 'VIDEO' ? <Video className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.customTitle || item.title}</h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{item.customDescription || item.description || 'No description'}</p>
                    </div>
                    <div>
                      <Badge variant="outline">{item.contentType}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

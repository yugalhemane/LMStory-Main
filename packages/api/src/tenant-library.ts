import { apiClient as api } from './ApiClient';

export interface TenantLibraryContent {
  id: string;
  tenantId: string;
  globalLibraryContentId: string;
  title: string;
  customTitle: string | null;
  customDescription: string | null;
  customThumbnail: string | null;
  customStatus: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' | null;
  contentType: string;
  assets?: TenantLibraryAsset[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TenantLibraryAsset {
  id: string;
  tenantLibraryId: string;
  name: string;
  url?: string;
  fileType: string;
  fileSize: number;
  sourceType: 'UPLOADED' | 'EXTERNAL';
  uploadStatus: 'PENDING' | 'CONFIRMED';
  objectKey?: string;
  originalFilename?: string;
  createdAt: string;
}

export interface ImportGlobalContentDto {
  globalLibraryContentId: string;
}

export interface UpdateTenantLibraryDto {
  customTitle?: string;
  customDescription?: string;
  customThumbnail?: string;
  customStatus?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
}

export interface PresignUploadDto {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface ConfirmUploadDto {
  objectKey: string;
  name: string;
}

export interface CreateExternalLinkDto {
  url: string;
  name: string;
}

export const tenantLibraryApi = {
  importContent: (data: ImportGlobalContentDto) => 
    api.post<{ data: TenantLibraryContent }>('/api/tenant-library/import', data),
    
  getContent: (id: string) => 
    api.get<{ data: TenantLibraryContent }>(`/api/tenant-library/${id}`),
    
  listContent: (params?: any) => 
    api.get<{ data: { data: TenantLibraryContent[]; total: number } }>('/api/tenant-library', { params }),
    
  updateContent: (id: string, data: UpdateTenantLibraryDto) => 
    api.patch<{ data: TenantLibraryContent }>(`/api/tenant-library/${id}`, data),

  // V1.1 Asset APIs
  presignUpload: (id: string, data: PresignUploadDto) =>
    api.post<{ data: { uploadUrl: string; objectKey: string } }>(`/api/tenant-library/${id}/assets/presign`, data).then(r => r.data.data),

  confirmUpload: (id: string, data: ConfirmUploadDto) =>
    api.post<{ data: TenantLibraryAsset }>(`/api/tenant-library/${id}/assets/confirm`, data).then(r => r.data.data),

  createExternalLink: (id: string, data: CreateExternalLinkDto) =>
    api.post<{ data: TenantLibraryAsset }>(`/api/tenant-library/${id}/assets/link`, data).then(r => r.data.data),
};


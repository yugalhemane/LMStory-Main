import { TenantLibraryRepository } from '../repository/tenantLibrary.repository';
import { ImportGlobalContentDto, UpdateTenantLibraryDto, ListTenantLibraryDto } from '../dto/tenantLibrary.dto';
import { logger } from '../../../shared/logger';
import { NotFoundError } from '../../../shared/errors';
import { Prisma } from '@prisma/client';

export class TenantLibraryService {
  private tenantLibraryRepository: TenantLibraryRepository;

  constructor() {
    this.tenantLibraryRepository = new TenantLibraryRepository();
  }

  public async importContent(tenantId: string, data: ImportGlobalContentDto, currentUserId: string) {
    const imported = await this.tenantLibraryRepository.importFromGlobal(tenantId, data.globalLibraryContentId, currentUserId);
    logger.info(`Content Imported: Global ${data.globalLibraryContentId} to Tenant ${tenantId} Library ${imported.id}`);
    return imported;
  }

  public async getContent(id: string, tenantId: string) {
    const content = await this.tenantLibraryRepository.findById(id, tenantId);
    if (!content) {
      throw new NotFoundError('Tenant Library content not found');
    }
    return content;
  }

  public async listContent(tenantId: string, query: ListTenantLibraryDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const params: any = { page, limit };
    
    if (filters.search !== undefined) params.search = filters.search;
    if (filters.categoryId !== undefined) params.categoryId = filters.categoryId;
    if (filters.authorId !== undefined) params.authorId = filters.authorId;
    if (filters.contentType !== undefined) params.contentType = filters.contentType;
    if (filters.difficulty !== undefined) params.difficulty = filters.difficulty;
    if (filters.status !== undefined) params.status = filters.status;
    if (filters.language !== undefined) params.language = filters.language;

    return this.tenantLibraryRepository.searchAndPaginate(tenantId, params);
  }

  public async updateContent(id: string, tenantId: string, data: UpdateTenantLibraryDto, currentUserId: string) {
    const updateData: Prisma.TenantLibraryUpdateInput = {
      updatedBy: currentUserId,
    };

    if (data.customTitle !== undefined) updateData.customTitle = data.customTitle;
    if (data.customDescription !== undefined) updateData.customDescription = data.customDescription;
    if (data.customThumbnail !== undefined) updateData.customThumbnail = data.customThumbnail;
    if (data.customStatus !== undefined) updateData.customStatus = data.customStatus;

    const updated = await this.tenantLibraryRepository.updateContent(id, tenantId, updateData);
    logger.info(`Tenant Library Content Overrides Updated: ${id} in Tenant ${tenantId}`);
    return updated;
  }

  public async softDeleteContent(id: string, tenantId: string, currentUserId: string) {
    await this.tenantLibraryRepository.softDelete(id, tenantId, currentUserId);
    logger.info(`Tenant Library Content Deleted (Soft): ${id} in Tenant ${tenantId}`);
  }

  public async restoreContent(id: string, tenantId: string, currentUserId: string) {
    const restored = await this.tenantLibraryRepository.restore(id, tenantId, currentUserId);
    logger.info(`Tenant Library Content Restored: ${id} in Tenant ${tenantId}`);
    return restored;
  }

  // --- V1.1 MEDIA DELIVERY & INTEGRITY ---

  public async presignUpload(id: string, tenantId: string, data: { fileName: string; fileType: string; fileSize: number }, _currentUserId: string) {
    const content = await this.tenantLibraryRepository.findById(id, tenantId);
    if (!content) throw new NotFoundError('Library item not found');

    // Mime type & Size Validation
    this.validateMimeAndSize(data.fileType, data.fileSize);

    const objectKey = `tenants/${tenantId}/library/${id}/assets/${crypto.randomUUID()}`;
    
    // Create PENDING asset
    await this.tenantLibraryRepository.createAsset({
      tenantLibraryId: id,
      name: data.fileName,
      fileType: data.fileType,
      fileSize: BigInt(data.fileSize),
      sourceType: 'UPLOADED',
      uploadStatus: 'PENDING',
      objectKey,
      originalFilename: data.fileName
    });

    const storage = await import('../../../shared/storage/index.js').then(m => m.getStorageProvider());
    const uploadUrl = await storage.createUploadUrl(objectKey, data.fileType, data.fileSize);

    logger.info(`Presigned Upload generated for Tenant ${tenantId}, Key ${objectKey}`);
    return { uploadUrl, objectKey };
  }

  public async confirmUpload(id: string, tenantId: string, data: { objectKey: string; name: string }, _currentUserId: string) {
    const content = await this.tenantLibraryRepository.findById(id, tenantId);
    if (!content) throw new NotFoundError('Library item not found');

    // Find PENDING asset
    const pendingAsset = await this.tenantLibraryRepository.findAssetByKey(data.objectKey, id);
    if (!pendingAsset) throw new NotFoundError('Pending upload not found');
    if (pendingAsset.uploadStatus === 'CONFIRMED') return pendingAsset; // Idempotent

    // Verify through StorageProvider
    const storage = await import('../../../shared/storage/index.js').then(m => m.getStorageProvider());
    const verified = await storage.verifyObject(data.objectKey);
    if (!verified) throw new NotFoundError('Uploaded object not found in storage');

    this.validateMimeAndSize(verified.contentType, verified.size);
    if (verified.contentType !== pendingAsset.fileType) {
      throw new Error(`Content-Type mismatch: expected ${pendingAsset.fileType}, found ${verified.contentType}`);
    }

    const confirmed = await this.tenantLibraryRepository.updateAssetStatus(pendingAsset.id, 'CONFIRMED');
    logger.info(`Upload Confirmed for Tenant ${tenantId}, Key ${data.objectKey}`);
    return confirmed;
  }

  public async createExternalLink(id: string, tenantId: string, data: { url: string; name: string }, _currentUserId: string) {
    const content = await this.tenantLibraryRepository.findById(id, tenantId);
    if (!content) throw new NotFoundError('Library item not found');

    const asset = await this.tenantLibraryRepository.createAsset({
      tenantLibraryId: id,
      name: data.name,
      fileType: 'link',
      fileSize: BigInt(0),
      sourceType: 'EXTERNAL',
      uploadStatus: 'CONFIRMED', // External links are implicitly confirmed
      url: data.url
    });

    logger.info(`External Link created for Tenant ${tenantId}, URL ${data.url}`);
    return asset;
  }

  private validateMimeAndSize(mimeType: string, sizeBytes: number) {
    const allowed = ['video/mp4', 'video/webm', 'application/pdf'];
    if (!allowed.includes(mimeType)) {
      throw new Error('Unsupported Media Type. Allowed: mp4, webm, pdf');
    }
    const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

    if (mimeType.startsWith('video/') && sizeBytes > MAX_VIDEO_SIZE) {
      throw new Error('Video exceeds 2GB maximum');
    }
    if (mimeType === 'application/pdf' && sizeBytes > MAX_PDF_SIZE) {
      throw new Error('PDF exceeds 50MB maximum');
    }
  }
}

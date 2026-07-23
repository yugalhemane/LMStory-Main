import { prisma } from '../../../database/prisma';
import { Prisma, TenantLibrary, ContentStatus } from '@prisma/client';
import { NotFoundError, ConflictError, ValidationError } from '../../../shared/errors';

export class TenantLibraryRepository {
  public async findById(id: string, tenantId: string): Promise<TenantLibrary | null> {
    return prisma.tenantLibrary.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        category: true,
        author: true,
        assets: true,
        imports: true,
      }
    });
  }

  public async updateContent(id: string, tenantId: string, data: Prisma.TenantLibraryUpdateInput): Promise<TenantLibrary> {
    const existing = await prisma.tenantLibrary.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new NotFoundError('Tenant Library content not found');

    return prisma.tenantLibrary.update({
      where: { id },
      data,
    });
  }

  public async searchAndPaginate(
    tenantId: string,
    params: {
      search?: string;
      categoryId?: string;
      authorId?: string;
      contentType?: string;
      difficulty?: string;
      status?: ContentStatus;
      language?: string;
      page: number;
      limit: number;
    }
  ) {
    const where: Prisma.TenantLibraryWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { customTitle: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { customDescription: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.authorId) where.authorId = params.authorId;
    if (params.contentType) where.contentType = params.contentType as any;
    if (params.difficulty) where.difficulty = params.difficulty as any;
    if (params.language) where.language = params.language;

    if (params.status) {
      // Status could be customStatus or fallback to status
      // We can search by customStatus if set, else status.
      // For simplicity, we just look at the effective status if we were storing it,
      // but Prisma makes this complex. We'll search both:
      where.OR = [
        ...(where.OR || []),
        { customStatus: params.status },
        { status: params.status, customStatus: null },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [contents, total] = await Promise.all([
      prisma.tenantLibrary.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } },
        },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenantLibrary.count({ where }),
    ]);

    return {
      data: contents,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  public async softDelete(id: string, tenantId: string, deletedBy: string): Promise<TenantLibrary> {
    const existing = await prisma.tenantLibrary.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Content not found');

    return prisma.tenantLibrary.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        archivedBy: deletedBy,
      },
    });
  }

  public async restore(id: string, tenantId: string, restoredBy: string): Promise<TenantLibrary> {
    const existing = await prisma.tenantLibrary.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Content not found');

    return prisma.tenantLibrary.update({
      where: { id },
      data: {
        deletedAt: null,
        restoredBy,
      },
    });
  }

  public async importFromGlobal(tenantId: string, globalContentId: string, importedBy: string): Promise<TenantLibrary> {
    // 1. Verify Global Content exists and is PUBLISHED
    const globalContent = await prisma.libraryContent.findFirst({
      where: { id: globalContentId, deletedAt: null },
      include: { assets: true }
    });

    if (!globalContent) {
      throw new NotFoundError('Global content not found');
    }

    if (globalContent.status !== 'PUBLISHED') {
      throw new ValidationError('Only PUBLISHED global content can be imported');
    }

    // 2. Prevent Duplicate Imports
    const existingImport = await prisma.tenantLibraryImport.findUnique({
      where: { tenantId_globalLibraryContentId: { tenantId, globalLibraryContentId: globalContentId } }
    });

    if (existingImport) {
      throw new ConflictError('This content has already been imported into your library');
    }

    // 3. Execute the Clone within a Transaction
    return prisma.$transaction(async (tx) => {
      // 3a. Create TenantLibrary clone
      const tenantLibrary = await tx.tenantLibrary.create({
        data: {
          tenantId,
          title: globalContent.title,
          slug: globalContent.slug, // This is unique per tenant because it's [tenantId, slug]
          description: globalContent.description,
          shortDescription: globalContent.shortDescription,
          contentType: globalContent.contentType,
          status: globalContent.status,
          difficulty: globalContent.difficulty,
          estimatedDuration: globalContent.estimatedDuration,
          language: globalContent.language,
          thumbnail: globalContent.thumbnail,
          coverImage: globalContent.coverImage,
          categoryId: globalContent.categoryId,
          authorId: globalContent.authorId,
          createdBy: importedBy,
        }
      });

      // 3b. Clone Assets
      if (globalContent.assets.length > 0) {
        const assetsData = globalContent.assets.map(asset => ({
          tenantLibraryId: tenantLibrary.id,
          name: asset.name,
          url: asset.url,
          fileType: asset.fileType,
          fileSize: asset.fileSize,
        }));

        await tx.tenantLibraryAsset.createMany({
          data: assetsData
        });
      }

      // 3c. Create Import Record
      await tx.tenantLibraryImport.create({
        data: {
          tenantId,
          tenantLibraryId: tenantLibrary.id,
          globalLibraryContentId: globalContent.id,
          globalVersion: globalContent.version,
          syncStatus: 'SYNCED',
          importedBy,
        }
      });

      return tenantLibrary;
    });
  }

  // --- V1.1 Asset Methods ---
  
  public async createAsset(data: Prisma.TenantLibraryAssetUncheckedCreateInput) {
    return prisma.tenantLibraryAsset.create({ data });
  }

  public async findAssetByKey(objectKey: string, tenantLibraryId: string) {
    return prisma.tenantLibraryAsset.findFirst({
      where: { objectKey, tenantLibraryId }
    });
  }

  public async updateAssetStatus(id: string, status: 'PENDING' | 'CONFIRMED') {
    return prisma.tenantLibraryAsset.update({
      where: { id },
      data: { uploadStatus: status }
    });
  }
}

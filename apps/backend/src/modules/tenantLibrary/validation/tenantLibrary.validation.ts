import { z } from 'zod';
import { ContentType, Difficulty, ContentStatus } from '@prisma/client';

export const importGlobalContentSchema = z.object({
  body: z.object({
    globalLibraryContentId: z.string().uuid('Invalid Global Library Content ID'),
  }),
});

export const updateTenantLibrarySchema = z.object({
  body: z.object({
    customTitle: z.string().min(3).max(200).optional(),
    customDescription: z.string().optional(),
    customThumbnail: z.string().url().optional(),
    customStatus: z.nativeEnum(ContentStatus).optional(),
  }),
});

export const listTenantLibrarySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    authorId: z.string().uuid().optional(),
    contentType: z.nativeEnum(ContentType).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
    language: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1 as any),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10 as any),
  }),
});

export const presignUploadSchema = z.object({
  body: z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1), // Basic check here, deeper check in service
    fileSize: z.number().positive(),
  }),
});

export const confirmUploadSchema = z.object({
  body: z.object({
    objectKey: z.string().min(1),
    name: z.string().min(1),
  }),
});

export const createExternalLinkSchema = z.object({
  body: z.object({
    url: z.string().url().refine(u => u.startsWith('https://'), { message: "Only HTTPS URLs are allowed" }),
    name: z.string().min(1),
  }),
});

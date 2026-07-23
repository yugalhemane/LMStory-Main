import { z } from 'zod';
import { ContentType, Difficulty } from '@prisma/client';

export const createLibraryContentSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    contentType: z.nativeEnum(ContentType),
    difficulty: z.nativeEnum(Difficulty),
    estimatedDuration: z.number().int().positive().optional(),
    language: z.string().default('en'),
    thumbnail: z.string().url().optional(),
    coverImage: z.string().url().optional(),
    categoryId: z.string().uuid().optional(),
    authorId: z.string().uuid().optional(),
    tags: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
  }),
});

export const updateLibraryContentSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    estimatedDuration: z.number().int().positive().optional(),
    language: z.string().optional(),
    thumbnail: z.string().url().optional(),
    coverImage: z.string().url().optional(),
    categoryId: z.string().uuid().optional(),
    authorId: z.string().uuid().optional(),
  }),
});

export const listLibraryContentSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    authorId: z.string().uuid().optional(),
    tag: z.string().optional(),
    skill: z.string().optional(),
    contentType: z.nativeEnum(ContentType).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
    language: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1 as any),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10 as any),
  }),
});

export const createVersionSchema = z.object({
  body: z.object({
    changeLog: z.string().optional(),
  }),
});

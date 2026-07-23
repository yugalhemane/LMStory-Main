import { z } from 'zod';
import { CourseStatus, CourseItemType, CompletionCriteria } from '@prisma/client';

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    estimatedDuration: z.number().int().positive().optional(),
    thumbnail: z.string().url().optional(),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    status: z.nativeEnum(CourseStatus).optional(),
    estimatedDuration: z.number().int().positive().optional(),
    thumbnail: z.string().url().optional(),
  }),
});

export const listCoursesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.nativeEnum(CourseStatus).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1 as any),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10 as any),
  }),
});

export const createCourseSectionSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(150),
    description: z.string().optional(),
  }),
});

export const reorderItemsSchema = z.object({
  body: z.object({
    orderedIds: z.array(z.string().uuid()),
  }),
});

export const addCourseItemSchema = z.object({
  body: z.object({
    tenantLibraryId: z.string().uuid(),
    itemType: z.nativeEnum(CourseItemType),
    isMandatory: z.boolean().optional().default(true),
    completionCriteria: z.nativeEnum(CompletionCriteria).optional().default('VIEW'),
  }),
});

import { z } from 'zod';
import { createLibraryContentSchema, updateLibraryContentSchema, listLibraryContentSchema, createVersionSchema } from '../validation/library.validation';

export type CreateLibraryContentDto = z.infer<typeof createLibraryContentSchema>['body'];
export type UpdateLibraryContentDto = z.infer<typeof updateLibraryContentSchema>['body'];
export type ListLibraryContentDto = z.infer<typeof listLibraryContentSchema>['query'];
export type CreateLibraryVersionDto = z.infer<typeof createVersionSchema>['body'];

import { z } from 'zod';
import { 
  createCourseSchema, 
  updateCourseSchema, 
  listCoursesSchema, 
  createCourseSectionSchema, 
  addCourseItemSchema, 
  reorderItemsSchema 
} from '../validation/course.validation';

export type CreateCourseDto = z.infer<typeof createCourseSchema>['body'];
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>['body'];
export type ListCoursesDto = z.infer<typeof listCoursesSchema>['query'];
export type CreateCourseSectionDto = z.infer<typeof createCourseSectionSchema>['body'];
export type AddCourseItemDto = z.infer<typeof addCourseItemSchema>['body'];
export type ReorderItemsDto = z.infer<typeof reorderItemsSchema>['body'];

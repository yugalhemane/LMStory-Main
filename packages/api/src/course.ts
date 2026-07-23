import { apiClient as api } from './ApiClient';

export interface Course {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  estimatedDuration: number | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
}

export interface CourseItem {
  id: string;
  sectionId: string;
  tenantLibraryId: string;
  itemType: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'SCORM' | 'INTERACTIVE';
  title: string;
  isMandatory: boolean;
  order: number;
  completionCriteria: 'VIEW' | 'TIME' | 'SCORE' | 'INTERACTION';
}

export interface CreateCourseDto {
  title: string;
  description?: string;
  estimatedDuration?: number;
  thumbnail?: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  estimatedDuration?: number;
  thumbnail?: string;
}

export interface CreateCourseSectionDto {
  title: string;
  description?: string;
}

export interface AddCourseItemDto {
  tenantLibraryId: string;
  itemType: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'SCORM' | 'INTERACTIVE';
  isMandatory?: boolean;
  completionCriteria?: 'VIEW' | 'TIME' | 'SCORE' | 'INTERACTION';
}

export const courseApi = {
  createCourse: (data: CreateCourseDto) => 
    api.post<Course>('/api/courses', data),
  
  getCourse: (id: string) => 
    api.get<Course>(`/api/courses/${id}`),
  
  listCourses: (params?: any) => 
    api.get<{ data: Course[]; total: number }>('/api/courses', { params }),
  
  updateCourse: (id: string, data: UpdateCourseDto) => 
    api.patch<Course>(`/api/courses/${id}`, data),
    
  addSection: (courseId: string, data: CreateCourseSectionDto) => 
    api.post<CourseSection>(`/api/courses/${courseId}/sections`, data),
    
  reorderSections: (courseId: string, orderedIds: string[]) => 
    api.post<void>(`/api/courses/${courseId}/sections/reorder`, { orderedIds }),
    
  addItem: (courseId: string, sectionId: string, data: AddCourseItemDto) => 
    api.post<CourseItem>(`/api/courses/${courseId}/sections/${sectionId}/items`, data),
    
  reorderItems: (courseId: string, sectionId: string, orderedIds: string[]) => 
    api.post<void>(`/api/courses/${courseId}/sections/${sectionId}/items/reorder`, { orderedIds })
};

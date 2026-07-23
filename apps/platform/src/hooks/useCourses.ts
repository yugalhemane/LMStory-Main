import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi, CreateCourseDto, UpdateCourseDto, CreateCourseSectionDto, AddCourseItemDto } from 'api';

export const useCourses = (params?: any) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseApi.listCourses(params).then((res: any) => res.data as { data: any[], meta: any }),
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseApi.getCourse(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseDto) => courseApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) => courseApi.updateCourse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
  });
};

export const useAddCourseSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: CreateCourseSectionDto }) => courseApi.addSection(courseId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
};

export const useReorderCourseSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, orderedIds }: { courseId: string; orderedIds: string[] }) => courseApi.reorderSections(courseId, orderedIds),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
};

export const useAddCourseItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, sectionId, data }: { courseId: string; sectionId: string; data: AddCourseItemDto }) => 
      courseApi.addItem(courseId, sectionId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
};

export const useReorderCourseItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, sectionId, orderedIds }: { courseId: string; sectionId: string; orderedIds: string[] }) => 
      courseApi.reorderItems(courseId, sectionId, orderedIds),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
};

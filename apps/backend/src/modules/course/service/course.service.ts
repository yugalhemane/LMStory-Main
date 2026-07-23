import { CourseRepository } from '../repository/course.repository';
import { CreateCourseDto, UpdateCourseDto, ListCoursesDto, CreateCourseSectionDto, AddCourseItemDto } from '../dto/course.dto';
import { NotFoundError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import crypto from 'crypto';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  private generateSlug(title: string): string {
    const baseSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    return `${baseSlug}-${randomSuffix}`;
  }

  public async createCourse(tenantId: string, data: CreateCourseDto, currentUserId: string) {
    const course = await this.courseRepository.create(tenantId, {
      title: data.title,
      slug: this.generateSlug(data.title),
      description: data.description || null,
      estimatedDuration: data.estimatedDuration || null,
      thumbnail: data.thumbnail || null,
      createdBy: currentUserId,
    } as any);
    logger.info(`Course Created: ${course.id} in Tenant ${tenantId}`);
    return course;
  }

  public async getCourse(id: string, tenantId: string) {
    const course = await this.courseRepository.findById(id, tenantId);
    if (!course) throw new NotFoundError('Course not found');
    return course;
  }

  public async listCourses(tenantId: string, query: ListCoursesDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const params: any = { page, limit };
    if (filters.search !== undefined) params.search = filters.search;
    if (filters.status !== undefined) params.status = filters.status;
    return this.courseRepository.searchAndPaginate(tenantId, params);
  }

  public async updateCourse(id: string, tenantId: string, data: UpdateCourseDto, currentUserId: string) {
    const updateData: any = { updatedBy: currentUserId };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.estimatedDuration !== undefined) updateData.estimatedDuration = data.estimatedDuration;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    
    const updated = await this.courseRepository.update(id, tenantId, updateData);
    logger.info(`Course Updated: ${id} in Tenant ${tenantId}`);
    return updated;
  }

  public async deleteCourse(id: string, tenantId: string, currentUserId: string) {
    await this.courseRepository.softDelete(id, tenantId, currentUserId);
    logger.info(`Course Deleted: ${id} in Tenant ${tenantId}`);
  }

  public async restoreCourse(id: string, tenantId: string, currentUserId: string) {
    return this.courseRepository.restore(id, tenantId, currentUserId);
  }

  public async publishCourse(id: string, tenantId: string, currentUserId: string) {
    const published = await this.courseRepository.publish(id, tenantId, currentUserId);
    logger.info(`Course Published: ${id} in Tenant ${tenantId}`);
    return published;
  }

  public async createVersion(id: string, tenantId: string, currentUserId: string, changeLog?: string) {
    await this.courseRepository.createVersionSnapshot(id, tenantId, currentUserId, changeLog);
    logger.info(`Course Version Created: ${id} in Tenant ${tenantId}`);
  }

  // --- SECTIONS ---
  public async addSection(courseId: string, tenantId: string, data: CreateCourseSectionDto) {
    return this.courseRepository.createSection(courseId, tenantId, {
      title: data.title,
      description: data.description || undefined
    } as any);
  }

  public async reorderSections(courseId: string, tenantId: string, orderedIds: string[]) {
    await this.courseRepository.reorderSections(courseId, tenantId, orderedIds);
  }

  // --- ITEMS ---
  public async addItem(courseId: string, sectionId: string, tenantId: string, data: AddCourseItemDto) {
    return this.courseRepository.addItemToSection(courseId, sectionId, tenantId, data);
  }

  public async reorderItems(courseId: string, sectionId: string, tenantId: string, orderedIds: string[]) {
    await this.courseRepository.reorderItems(courseId, sectionId, tenantId, orderedIds);
  }
}

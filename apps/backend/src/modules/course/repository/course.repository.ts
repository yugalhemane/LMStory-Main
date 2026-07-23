import { prisma } from '../../../database/prisma';
import { Prisma, Course, CourseSection, CourseItem, CourseStatus } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../../shared/errors';

export class CourseRepository {
  public async create(tenantId: string, data: Omit<Prisma.CourseUncheckedCreateInput, 'tenantId'>): Promise<Course> {
    const createData = { ...data, tenantId };
    return prisma.course.create({ data: createData as Prisma.CourseUncheckedCreateInput });
  }

  public async findById(id: string, tenantId: string): Promise<Course | null> {
    return prisma.course.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: { tenantLibrary: true }
            }
          }
        }
      }
    });
  }

  public async update(id: string, tenantId: string, data: Prisma.CourseUpdateInput): Promise<Course> {
    const existing = await prisma.course.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new NotFoundError('Course not found');
    return prisma.course.update({ where: { id }, data });
  }

  public async searchAndPaginate(
    tenantId: string,
    params: {
      search?: string;
      status?: CourseStatus;
      page: number;
      limit: number;
    }
  ) {
    const where: Prisma.CourseWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.status) where.status = params.status;

    const skip = (params.page - 1) * params.limit;
    const [courses, total] = await Promise.all([
      prisma.course.findMany({ where, skip, take: params.limit, orderBy: { createdAt: 'desc' } }),
      prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  public async softDelete(id: string, tenantId: string, archivedBy: string): Promise<Course> {
    const existing = await prisma.course.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Course not found');
    return prisma.course.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED', archivedBy },
    });
  }

  public async restore(id: string, tenantId: string, updatedBy: string): Promise<Course> {
    const existing = await prisma.course.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundError('Course not found');
    return prisma.course.update({
      where: { id },
      data: { deletedAt: null, status: 'DRAFT', updatedBy },
    });
  }

  // --- SECTIONS ---

  public async createSection(courseId: string, tenantId: string, data: { title: string, description?: string }): Promise<CourseSection> {
    const course = await prisma.course.findFirst({ where: { id: courseId, tenantId, deletedAt: null } });
    if (!course) throw new NotFoundError('Course not found');

    const lastSection = await prisma.courseSection.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });

    const order = lastSection ? lastSection.order + 1000 : 1000;

    return prisma.courseSection.create({
      data: { courseId, title: data.title, description: data.description || null, order },
    });
  }

  public async reorderSections(courseId: string, tenantId: string, orderedIds: string[]): Promise<void> {
    const course = await prisma.course.findFirst({ where: { id: courseId, tenantId, deletedAt: null } });
    if (!course) throw new NotFoundError('Course not found');

    // Gap based order assignment: 1000, 2000, 3000...
    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.courseSection.update({
          where: { id },
          data: { order: (index + 1) * 1000 }
        })
      )
    );
  }

  // --- ITEMS ---

  public async addItemToSection(
    courseId: string,
    sectionId: string, 
    tenantId: string, 
    data: Omit<Prisma.CourseItemUncheckedCreateInput, 'sectionId' | 'order'>
  ): Promise<CourseItem> {
    const course = await prisma.course.findFirst({ where: { id: courseId, tenantId, deletedAt: null } });
    if (!course) throw new NotFoundError('Course not found');

    const section = await prisma.courseSection.findFirst({ where: { id: sectionId, courseId } });
    if (!section) throw new NotFoundError('Section not found in this course');

    // Verify tenantLibrary item belongs to this tenant and is not deleted
    const libraryItem = await prisma.tenantLibrary.findFirst({ 
      where: { id: data.tenantLibraryId, tenantId, deletedAt: null } 
    });
    if (!libraryItem) throw new NotFoundError('Tenant Library item not found');

    const lastItem = await prisma.courseItem.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
    });

    const order = lastItem ? lastItem.order + 1000 : 1000;

    return prisma.courseItem.create({
      data: {
        ...data,
        sectionId,
        order,
      }
    });
  }

  public async reorderItems(courseId: string, sectionId: string, tenantId: string, orderedIds: string[]): Promise<void> {
    const course = await prisma.course.findFirst({ where: { id: courseId, tenantId, deletedAt: null } });
    if (!course) throw new NotFoundError('Course not found');

    const section = await prisma.courseSection.findFirst({ where: { id: sectionId, courseId } });
    if (!section) throw new NotFoundError('Section not found');

    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.courseItem.update({
          where: { id },
          data: { order: (index + 1) * 1000 }
        })
      )
    );
  }

  // --- PUBLISHING & VERSIONING ---

  public async validateForPublishing(courseId: string, tenantId: string): Promise<void> {
    const course = await prisma.course.findFirst({
      where: { id: courseId, tenantId, deletedAt: null },
      include: {
        sections: {
          include: {
            items: {
              include: { tenantLibrary: true }
            }
          }
        }
      }
    });
    if (!course) throw new NotFoundError('Course not found');

    if (course.sections.length === 0) {
      throw new ValidationError('Course must have at least one section to be published');
    }

    for (const section of course.sections) {
      if (section.items.length === 0) {
        throw new ValidationError(`Section '${section.title}' must contain at least one item`);
      }
      for (const item of section.items) {
        if (item.tenantLibrary.status !== 'PUBLISHED') {
          throw new ValidationError(`Library item '${item.tenantLibrary.title}' is not published`);
        }
      }
    }
  }

  public async publish(courseId: string, tenantId: string, publishedBy: string): Promise<Course> {
    await this.validateForPublishing(courseId, tenantId);
    return prisma.course.update({
      where: { id: courseId },
      data: { status: 'PUBLISHED', publishedAt: new Date(), publishedBy },
    });
  }

  public async createVersionSnapshot(courseId: string, tenantId: string, createdBy: string, changeLog?: string): Promise<void> {
    const course = await this.findById(courseId, tenantId);
    if (!course) throw new NotFoundError('Course not found');

    const newVersion = course.version + 1;

    await prisma.$transaction([
      prisma.courseVersion.create({
        data: {
          courseId,
          version: newVersion,
          changeLog: changeLog || null,
          dataSnapshot: JSON.stringify(course),
          createdBy,
        }
      }),
      prisma.course.update({
        where: { id: courseId },
        data: { version: newVersion, updatedBy: createdBy }
      })
    ]);
  }
}

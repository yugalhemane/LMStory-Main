import { prisma } from '../../../database/prisma';
import { Prisma, LibraryContent, ContentStatus } from '@prisma/client';


export class LibraryRepository {
  public async createContent(data: Prisma.LibraryContentUncheckedCreateInput): Promise<LibraryContent> {
    return prisma.libraryContent.create({ data });
  }

  public async findById(id: string): Promise<LibraryContent | null> {
    return prisma.libraryContent.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        author: true,
        tags: true,
        skills: true,
      }
    });
  }

  public async findBySlug(slug: string): Promise<LibraryContent | null> {
    return prisma.libraryContent.findFirst({
      where: { slug, deletedAt: null },
    });
  }

  public async updateContent(id: string, data: Prisma.LibraryContentUpdateInput): Promise<LibraryContent> {
    return prisma.libraryContent.update({
      where: { id },
      data,
    });
  }

  public async searchAndPaginate(params: {
    search?: string;
    categoryId?: string;
    authorId?: string;
    tag?: string;
    skill?: string;
    contentType?: string;
    difficulty?: string;
    status?: ContentStatus;
    language?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.LibraryContentWhereInput = {
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { shortDescription: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.authorId) where.authorId = params.authorId;
    if (params.contentType) where.contentType = params.contentType as any;
    if (params.difficulty) where.difficulty = params.difficulty as any;
    if (params.status) where.status = params.status;
    if (params.language) where.language = params.language;

    if (params.tag) {
      where.tags = { some: { name: params.tag } };
    }

    if (params.skill) {
      where.skills = { some: { name: params.skill } };
    }

    const skip = (params.page - 1) * params.limit;

    const [contents, total] = await Promise.all([
      prisma.libraryContent.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } },
          tags: { select: { id: true, name: true } },
        },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.libraryContent.count({ where }),
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

  public async softDelete(id: string, deletedBy: string): Promise<LibraryContent> {
    return prisma.libraryContent.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'ARCHIVED',
        archivedBy: deletedBy,
      },
    });
  }

  public async restore(id: string, restoredBy: string): Promise<LibraryContent> {
    return prisma.libraryContent.update({
      where: { id },
      data: {
        deletedAt: null,
        status: 'DRAFT',
        updatedBy: restoredBy,
      },
    });
  }

  public async publish(id: string, publishedBy: string): Promise<LibraryContent> {
    return prisma.libraryContent.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedBy,
      },
    });
  }

  public async archive(id: string, archivedBy: string): Promise<LibraryContent> {
    return prisma.libraryContent.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedBy,
      },
    });
  }

  public async getTagsByName(names: string[]) {
    return prisma.libraryTag.findMany({
      where: { name: { in: names } }
    });
  }

  public async createTags(names: string[]) {
    await prisma.libraryTag.createMany({
      data: names.map(name => ({ name })),
      skipDuplicates: true,
    });
    return this.getTagsByName(names);
  }

  public async getSkillsByName(names: string[]) {
    return prisma.librarySkill.findMany({
      where: { name: { in: names } }
    });
  }

  public async createSkills(names: string[]) {
    await prisma.librarySkill.createMany({
      data: names.map(name => ({ name })),
      skipDuplicates: true,
    });
    return this.getSkillsByName(names);
  }

  public async createVersionRecord(contentId: string, version: number, changeLog: string | null, dataSnapshot: any, createdBy: string) {
    return prisma.libraryVersion.create({
      data: {
        contentId,
        version,
        changeLog,
        dataSnapshot,
        createdBy
      }
    });
  }
}

import { LibraryRepository } from '../repository/library.repository';
import { CreateLibraryContentDto, UpdateLibraryContentDto, ListLibraryContentDto, CreateLibraryVersionDto } from '../dto/library.dto';
import { NotFoundError, ValidationError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

export class LibraryService {
  private libraryRepository: LibraryRepository;

  constructor() {
    this.libraryRepository = new LibraryRepository();
  }

  private generateSlug(title: string): string {
    const baseSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    return `${baseSlug}-${randomSuffix}`;
  }

  private async handleTags(tags: string[]) {
    const existingTags = await this.libraryRepository.getTagsByName(tags);
    const existingNames = existingTags.map(t => t.name);
    const missingNames = tags.filter(t => !existingNames.includes(t));
    
    let allTags = existingTags;
    if (missingNames.length > 0) {
      const newTags = await this.libraryRepository.createTags(missingNames);
      allTags = [...allTags, ...newTags];
    }
    return allTags.map(t => ({ id: t.id }));
  }

  private async handleSkills(skills: string[]) {
    const existingSkills = await this.libraryRepository.getSkillsByName(skills);
    const existingNames = existingSkills.map(t => t.name);
    const missingNames = skills.filter(t => !existingNames.includes(t));
    
    let allSkills = existingSkills;
    if (missingNames.length > 0) {
      const newSkills = await this.libraryRepository.createSkills(missingNames);
      allSkills = [...allSkills, ...newSkills];
    }
    return allSkills.map(s => ({ id: s.id }));
  }

  public async createContent(data: CreateLibraryContentDto, currentUserId: string) {
    const slug = this.generateSlug(data.title);

    const createInput: Prisma.LibraryContentUncheckedCreateInput = {
      title: data.title,
      slug,
      description: data.description || null,
      shortDescription: data.shortDescription || null,
      contentType: data.contentType,
      difficulty: data.difficulty,
      estimatedDuration: data.estimatedDuration || null,
      language: data.language || 'en',
      thumbnail: data.thumbnail || null,
      coverImage: data.coverImage || null,
      categoryId: data.categoryId || null,
      authorId: data.authorId || null,
      createdBy: currentUserId,
    };

    const content = await this.libraryRepository.createContent(createInput);

    if (data.tags && data.tags.length > 0) {
      const tagConnections = await this.handleTags(data.tags);
      await this.libraryRepository.updateContent(content.id, { tags: { connect: tagConnections } });
    }

    if (data.skills && data.skills.length > 0) {
      const skillConnections = await this.handleSkills(data.skills);
      await this.libraryRepository.updateContent(content.id, { skills: { connect: skillConnections } });
    }

    logger.info(`Global Library Content Created: ${content.id}`);
    return this.libraryRepository.findById(content.id);
  }

  public async getContent(id: string) {
    const content = await this.libraryRepository.findById(id);
    if (!content) throw new NotFoundError('Content not found');
    return content;
  }

  public async listContent(query: ListLibraryContentDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const params: any = { page, limit };
    
    if (filters.search !== undefined) params.search = filters.search;
    if (filters.categoryId !== undefined) params.categoryId = filters.categoryId;
    if (filters.authorId !== undefined) params.authorId = filters.authorId;
    if (filters.tag !== undefined) params.tag = filters.tag;
    if (filters.skill !== undefined) params.skill = filters.skill;
    if (filters.contentType !== undefined) params.contentType = filters.contentType;
    if (filters.difficulty !== undefined) params.difficulty = filters.difficulty;
    if (filters.status !== undefined) params.status = filters.status;
    if (filters.language !== undefined) params.language = filters.language;

    return this.libraryRepository.searchAndPaginate(params);
  }

  public async updateContent(id: string, data: UpdateLibraryContentDto, currentUserId: string) {
    const content = await this.libraryRepository.findById(id);
    if (!content) throw new NotFoundError('Content not found');

    const updateData: Prisma.LibraryContentUpdateInput = {
      updatedBy: currentUserId,
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.estimatedDuration !== undefined) updateData.estimatedDuration = data.estimatedDuration;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    if (data.authorId !== undefined) updateData.author = { connect: { id: data.authorId } };

    const updated = await this.libraryRepository.updateContent(id, updateData);
    logger.info(`Global Library Content Updated: ${id}`);
    return updated;
  }

  public async publishContent(id: string, currentUserId: string) {
    const content = await this.libraryRepository.findById(id);
    if (!content) throw new NotFoundError('Content not found');
    
    // Simple validation before publish
    if (!content.categoryId) throw new ValidationError('Content must have a category to be published');

    const published = await this.libraryRepository.publish(id, currentUserId);
    logger.info(`Global Library Content Published: ${id}`);
    return published;
  }

  public async archiveContent(id: string, currentUserId: string) {
    const content = await this.libraryRepository.findById(id);
    if (!content) throw new NotFoundError('Content not found');

    const archived = await this.libraryRepository.archive(id, currentUserId);
    logger.info(`Global Library Content Archived: ${id}`);
    return archived;
  }

  public async softDeleteContent(id: string, currentUserId: string) {
    const content = await this.libraryRepository.findById(id);
    if (!content) throw new NotFoundError('Content not found');

    await this.libraryRepository.softDelete(id, currentUserId);
    logger.info(`Global Library Content Deleted (Soft): ${id}`);
  }

  public async restoreContent(id: string, currentUserId: string) {
    // Restore logic (requires a custom find because it might be deleted)
    const restored = await this.libraryRepository.restore(id, currentUserId);
    logger.info(`Global Library Content Restored: ${id}`);
    return restored;
  }

  public async createVersion(id: string, data: CreateLibraryVersionDto, currentUserId: string) {
    const content = await this.libraryRepository.findById(id);
    if (!content) throw new NotFoundError('Content not found');

    const newVersion = content.version + 1;
    
    // Create the snapshot record
    await this.libraryRepository.createVersionRecord(
      id,
      content.version,
      data.changeLog || null,
      JSON.stringify(content),
      currentUserId
    );

    // Bump the version on the main content
    const updated = await this.libraryRepository.updateContent(id, {
      version: newVersion,
      updatedBy: currentUserId
    });

    logger.info(`Global Library Content Version ${newVersion} Created for: ${id}`);
    return updated;
  }
}

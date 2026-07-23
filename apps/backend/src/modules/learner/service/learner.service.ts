import { LearnerRepository } from '../repository/learner.repository';
import { UpdateLearnerProgressDto } from '../dto/learner.dto';
import { EnrollmentStatus, Prisma } from '@prisma/client';

export class LearnerService {
  private learnerRepository: LearnerRepository;

  constructor() {
    this.learnerRepository = new LearnerRepository();
  }

  public async getDashboard(tenantId: string, userId: string) {
    return this.learnerRepository.getDashboard(tenantId, userId);
  }

  public async getEnrollmentDetails(enrollmentId: string, tenantId: string, userId: string) {
    return this.learnerRepository.getEnrollmentDetails(enrollmentId, tenantId, userId);
  }

  public async updateProgress(progressId: string, tenantId: string, userId: string, data: UpdateLearnerProgressDto) {
    if (data.status === 'COMPLETED') {
      throw new Error('COMPLETED status cannot be set via generic update. Use explicit completion endpoints.');
    }

    const progressRecord = await this.learnerRepository.getProgressRecord(progressId, tenantId, userId);
    const now = new Date();
    
    // 1. Prepare Item Progress Update
    const progressUpdate: Prisma.EnrollmentProgressUpdateInput = {
      status: data.status,
      lastAccessedAt: now
    };
    if (data.timeSpentSeconds) progressUpdate.timeSpentSeconds = { increment: data.timeSpentSeconds };
    if (data.score !== undefined) progressUpdate.score = data.score;
    
    if (data.status === 'IN_PROGRESS' && progressRecord.status === 'NOT_STARTED') {
      progressUpdate.startedAt = now;
    }

    return this.applyProgressUpdate(progressRecord, progressUpdate, userId, `LESSON_${data.status}`);
  }

  // --- V1.1 EXPLICIT EVENTS & PLAYBACK ---

  public async getPlaybackUrl(progressId: string, tenantId: string, userId: string) {
    const record = await this.learnerRepository.getProgressRecord(progressId, tenantId, userId);
    
    const item = record.courseItem;
    if (!item || !item.tenantLibrary) {
      throw new Error('Course item or library content not found');
    }

    const assets: any[] = item.tenantLibrary.assets;
    if (!assets || assets.length === 0) {
      return { url: null, type: item.itemType };
    }

    // Pick first confirmed asset
    const asset = assets.find((a: any) => a.uploadStatus === 'CONFIRMED');
    if (!asset) {
      return { url: null, type: item.itemType };
    }

    if (asset.sourceType === 'EXTERNAL' && asset.url) {
      return { url: asset.url, type: item.itemType };
    }

    if (asset.sourceType === 'UPLOADED' && asset.objectKey) {
      const storage = await import('../../../shared/storage/index.js').then(m => m.getStorageProvider());
      const url = await storage.createReadUrl(asset.objectKey, 7200); // 2 hours
      return { url, type: item.itemType };
    }

    return { url: null, type: item.itemType };
  }

  public async markViewed(progressId: string, tenantId: string, userId: string) {
    const record = await this.learnerRepository.getProgressRecord(progressId, tenantId, userId);
    
    const update: Prisma.EnrollmentProgressUpdateInput = { lastAccessedAt: new Date() };
    if (record.status === 'NOT_STARTED') update.startedAt = new Date();

    if (record.courseItem.completionCriteria === 'VIEW' && record.status !== 'COMPLETED') {
      update.status = 'COMPLETED';
      update.completedAt = new Date();
    } else if (record.status === 'NOT_STARTED') {
      update.status = 'IN_PROGRESS';
    }

    return this.applyProgressUpdate(record, update, userId, 'LESSON_VIEWED');
  }

  public async markCompleted(progressId: string, tenantId: string, userId: string) {
    const record = await this.learnerRepository.getProgressRecord(progressId, tenantId, userId);

    if (record.courseItem.completionCriteria !== 'MANUAL') {
      throw new Error('This item cannot be manually marked as complete. Completion is determined by viewing or taking a quiz.');
    }

    if (record.status === 'COMPLETED') {
      return record; // Idempotent
    }

    const update: Prisma.EnrollmentProgressUpdateInput = {
      status: 'COMPLETED'
    };
    if (record.status === 'NOT_STARTED') update.startedAt = new Date();

    return this.applyProgressUpdate(record, update, userId, 'LESSON_COMPLETED');
  }

  // --- INTERNAL ROLLUP ENGINE ---

  private async applyProgressUpdate(
    progressRecord: any, 
    progressUpdate: Prisma.EnrollmentProgressUpdateInput, 
    userId: string,
    eventType: string
  ) {
    const now = new Date();
    
    // Recalculate Course Progress
    const allProgressRecords = progressRecord.enrollmentCourse.progress;
    const targetStatus = progressUpdate.status || progressRecord.status;
    const updatedRecords = allProgressRecords.map((p: any) => p.id === progressRecord.id ? { ...p, status: targetStatus } : p);
    
    let totalItems = 0;
    progressRecord.enrollmentCourse.campaignCourse.course.sections.forEach((s: any) => totalItems += s.items.length);
    let completedItems = updatedRecords.filter((p: any) => p.status === 'COMPLETED').length;
    
    let progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    if (progressPercentage > 100) progressPercentage = 100;

    let courseStatus: EnrollmentStatus = progressRecord.enrollmentCourse.status;
    if (courseStatus === 'NOT_STARTED' && targetStatus !== 'NOT_STARTED') courseStatus = 'IN_PROGRESS';
    if (progressPercentage === 100) courseStatus = 'COMPLETED';

    const courseUpdate: Prisma.EnrollmentCourseUpdateInput = {
      status: courseStatus,
      progressPercentage,
      lastAccessedAt: now
    };

    if (courseStatus === 'IN_PROGRESS' && progressRecord.enrollmentCourse.status === 'NOT_STARTED') {
      courseUpdate.startedAt = now;
    }
    if (courseStatus === 'COMPLETED' && progressRecord.enrollmentCourse.status !== 'COMPLETED') {
      courseUpdate.completedAt = now;
    }

    // Recalculate Enrollment Status
    let enrollmentStatus = progressRecord.enrollmentCourse.enrollment.status;
    if (enrollmentStatus === 'NOT_STARTED' && courseStatus !== 'NOT_STARTED') enrollmentStatus = 'IN_PROGRESS';
    if (courseStatus === 'COMPLETED') enrollmentStatus = 'COMPLETED';

    const enrollmentUpdate: Prisma.EnrollmentUpdateInput = {
      status: enrollmentStatus,
      updatedBy: userId
    };

    await this.learnerRepository.updateProgressAndBubble(
      userId,
      progressRecord.id,
      progressRecord.enrollmentCourseId,
      progressRecord.enrollmentCourse.enrollmentId,
      progressUpdate,
      courseUpdate,
      enrollmentUpdate,
      eventType,
      { progressId: progressRecord.id }
    );

    return { success: true, progressPercentage, courseStatus };
  }
}

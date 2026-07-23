import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { LearnerService } from '../../src/modules/learner/service/learner.service';
import { LearnerRepository } from '../../src/modules/learner/repository/learner.repository';

jest.mock('../../src/modules/learner/repository/learner.repository');

describe('LearnerService - Completion Integrity', () => {
  let learnerService: LearnerService;
  let learnerRepositoryMock: jest.Mocked<LearnerRepository>;

  beforeEach(() => {
    learnerRepositoryMock = new LearnerRepository() as jest.Mocked<LearnerRepository>;
    learnerService = new LearnerService();
    (learnerService as any).learnerRepository = learnerRepositoryMock;
  });

  it('should throw an error when attempting to set COMPLETED status via generic updateProgress', async () => {
    learnerRepositoryMock.getProgressRecord.mockResolvedValue({
      id: 'prog-1',
      status: 'NOT_STARTED',
      courseItem: { id: 'item-1', completionCriteria: 'VIEW' },
      enrollmentCourse: { id: 'ec-1', enrollmentId: 'enr-1', progress: [] }
    } as any);

    await expect(learnerService.updateProgress('prog-1', 'tenant-1', 'user-1', { status: 'COMPLETED' }))
      .rejects.toThrow('COMPLETED status cannot be set via generic update. Use explicit completion endpoints.');
  });

  it('should complete a VIEW item when markViewed is called', async () => {
    learnerRepositoryMock.getProgressRecord.mockResolvedValue({
      id: 'prog-1',
      enrollmentCourseId: 'ec-1',
      status: 'NOT_STARTED',
      courseItem: { id: 'item-1', completionCriteria: 'VIEW', isMandatory: true },
      enrollmentCourse: {
        id: 'ec-1',
        enrollmentId: 'enr-1',
        progress: [],
        enrollment: { status: 'IN_PROGRESS' },
        campaignCourse: {
          course: {
            sections: [
              { items: [{ id: 'item-1', isMandatory: true }] }
            ]
          }
        }
      }
    } as any);

    learnerRepositoryMock.updateProgressAndBubble.mockResolvedValue(undefined);

    await learnerService.markViewed('prog-1', 'tenant-1', 'user-1');

    expect(learnerRepositoryMock.updateProgressAndBubble).toHaveBeenCalledWith(
      'user-1',
      'prog-1',
      'ec-1',
      'enr-1',
      expect.objectContaining({ status: 'COMPLETED' }),
      expect.anything(),
      expect.anything(),
      'LESSON_VIEWED',
      expect.anything()
    );
  });

  it('should NOT complete a MANUAL item when markViewed is called', async () => {
    learnerRepositoryMock.getProgressRecord.mockResolvedValue({
      id: 'prog-2',
      enrollmentCourseId: 'ec-1',
      status: 'NOT_STARTED',
      courseItem: { id: 'item-2', completionCriteria: 'MANUAL', isMandatory: true },
      enrollmentCourse: {
        id: 'ec-1',
        enrollmentId: 'enr-1',
        progress: [],
        enrollment: { status: 'IN_PROGRESS' },
        campaignCourse: {
          course: {
            sections: [
              { items: [{ id: 'item-2', isMandatory: true }] }
            ]
          }
        }
      }
    } as any);

    learnerRepositoryMock.updateProgressAndBubble.mockResolvedValue(undefined);

    await learnerService.markViewed('prog-2', 'tenant-1', 'user-1');

    expect(learnerRepositoryMock.updateProgressAndBubble).toHaveBeenCalledWith(
      'user-1',
      'prog-2',
      'ec-1',
      'enr-1',
      expect.objectContaining({ status: 'IN_PROGRESS' }),
      expect.anything(),
      expect.anything(),
      'LESSON_VIEWED',
      expect.anything()
    );
  });

  it('should reject markCompleted if item is not MANUAL criteria', async () => {
    learnerRepositoryMock.getProgressRecord.mockResolvedValue({
      id: 'prog-1',
      status: 'NOT_STARTED',
      courseItem: { id: 'item-1', completionCriteria: 'VIEW' },
      enrollmentCourse: { id: 'ec-1', enrollmentId: 'enr-1', progress: [] }
    } as any);

    await expect(learnerService.markCompleted('prog-1', 'tenant-1', 'user-1'))
      .rejects.toThrow('This item cannot be manually marked as complete');
  });
});

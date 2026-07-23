import { z } from 'zod';
import { 
  updateLearnerProgressSchema
} from '../validation/learner.validation';

export type UpdateLearnerProgressDto = z.infer<typeof updateLearnerProgressSchema>['body'];

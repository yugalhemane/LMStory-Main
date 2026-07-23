import { z } from 'zod';
import { 
  createTemplateSchema,
  updateTemplateSchema,
  updatePreferenceSchema
} from '../validation/notification.validation';

export type CreateNotificationTemplateDto = z.infer<typeof createTemplateSchema>['body'];
export type UpdateNotificationTemplateDto = z.infer<typeof updateTemplateSchema>['body'];
export type UpdateNotificationPreferenceDto = z.infer<typeof updatePreferenceSchema>['body'];

import { z } from 'zod';
import { 
  createCampaignSchema, 
  updateCampaignSchema, 
  listCampaignsSchema,
  attachCourseSchema,
  assignGroupSchema,
  assignUserSchema
} from '../validation/campaign.validation';

export type CreateCampaignDto = z.infer<typeof createCampaignSchema>['body'];
export type UpdateCampaignDto = z.infer<typeof updateCampaignSchema>['body'];
export type ListCampaignsDto = z.infer<typeof listCampaignsSchema>['query'];
export type AttachCourseDto = z.infer<typeof attachCourseSchema>['body'];
export type AssignGroupDto = z.infer<typeof assignGroupSchema>['body'];
export type AssignUserDto = z.infer<typeof assignUserSchema>['body'];

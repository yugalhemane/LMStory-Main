import { z } from 'zod';
import { createGroupSchema, updateGroupSchema, listGroupsSchema, addMemberSchema } from '../validation/group.validation';

export type CreateGroupDto = z.infer<typeof createGroupSchema>['body'];
export type UpdateGroupDto = z.infer<typeof updateGroupSchema>['body'];
export type ListGroupsDto = z.infer<typeof listGroupsSchema>['query'];
export type AddMemberDto = z.infer<typeof addMemberSchema>['body'];

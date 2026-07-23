import { z } from 'zod';
import { createUserSchema, updateUserSchema, listUsersSchema } from '../validation/user.validation';

export type CreateUserDto = z.infer<typeof createUserSchema>['body'];
export type UpdateUserDto = z.infer<typeof updateUserSchema>['body'];
export type ListUsersDto = z.infer<typeof listUsersSchema>['query'];

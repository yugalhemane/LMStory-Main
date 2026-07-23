import { z } from 'zod';
import { NotificationType, NotificationChannel } from '@prisma/client';

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    code: z.string().min(3),
    type: z.nativeEnum(NotificationType),
    channel: z.nativeEnum(NotificationChannel),
    subject: z.string().optional(),
    body: z.string().min(1),
    isActive: z.boolean().optional(),
  }),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    subject: z.string().optional(),
    body: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updatePreferenceSchema = z.object({
  body: z.object({
    type: z.nativeEnum(NotificationType),
    channel: z.nativeEnum(NotificationChannel),
    isEnabled: z.boolean(),
  }),
});

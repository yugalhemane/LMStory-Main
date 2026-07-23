import { z } from 'zod';

export const updateBrandingSchema = z.object({
  body: z.object({
    logoUrl: z.string().url().optional(),
    faviconUrl: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    typography: z.string().optional(),
    companyName: z.string().optional(),
    supportEmail: z.string().email().optional(),
    supportPhone: z.string().optional(),
    footerText: z.string().optional(),
    loginBackgroundUrl: z.string().url().optional(),
    dashboardTheme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional()
  })
});

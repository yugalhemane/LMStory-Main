import { z } from 'zod';

export const revokeCertificateSchema = z.object({
  body: z.object({
    revocationReason: z.string().min(10, 'Revocation reason must be at least 10 characters long').max(500),
  }),
});

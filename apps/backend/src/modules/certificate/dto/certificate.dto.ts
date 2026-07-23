import { z } from 'zod';
import { revokeCertificateSchema } from '../validation/certificate.validation';

export type RevokeCertificateDto = z.infer<typeof revokeCertificateSchema>['body'];

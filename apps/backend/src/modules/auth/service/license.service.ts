import { prisma } from '../../../database/prisma';

export class LicenseService {
  public async validateLicenseKey(licenseKey: string): Promise<boolean> {
    // In a real system, this would cryptographically verify the signature,
    // evaluate the embedded expiry, constraints, etc.
    // For this implementation, we simply find a matching active license in DB.
    
    const license = await prisma.license.findUnique({ where: { licenseKey } });
    if (!license) return false;

    if (license.status !== 'ACTIVE') return false;
    
    if (license.expiresAt && license.expiresAt < new Date()) {
      await prisma.license.update({ where: { id: license.id }, data: { status: 'EXPIRED' } });
      return false;
    }

    return true;
  }

  public async getLicenseStatus(tenantId: string) {
    const license = await prisma.license.findUnique({ where: { tenantId } });
    if (!license) return { valid: false, reason: 'NO_LICENSE_FOUND' };

    if (license.status === 'EXPIRED' || (license.expiresAt && license.expiresAt < new Date())) {
      return { valid: false, reason: 'EXPIRED' };
    }

    if (license.status !== 'ACTIVE') {
      return { valid: false, reason: license.status };
    }

    return { valid: true, license };
  }
}

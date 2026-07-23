import { prisma } from '../../../database/prisma';
import { NotFoundError, ConflictError } from '../../../shared/errors';

export class CertificateRepository {
  public async getEnrollmentForIssuance(enrollmentId: string, tenantId: string) {
    return prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId, deletedAt: null },
      include: {
        courses: true,
        user: true,
        tenant: true,
      }
    });
  }

  public async checkExistingCertificate(enrollmentId: string, courseId: string) {
    return prisma.enrollmentCertificate.findFirst({
      where: { enrollmentId, courseId, status: 'ISSUED' }
    });
  }

  public async issueCertificate(
    tenantId: string,
    userId: string,
    enrollmentId: string,
    courseId: string,
    courseVersion: number,
    verificationToken: string,
    issuedBy: string
  ) {
    // Generate an immutable code
    const certificateCode = `CERT-${verificationToken.substring(0, 8).toUpperCase()}`;

    // Issue atomically
    return prisma.$transaction(async (tx) => {
      // Re-verify inside tx
      const exists = await tx.enrollmentCertificate.findFirst({
        where: { enrollmentId, courseId, status: 'ISSUED' }
      });
      
      if (exists) {
        throw new ConflictError('Active certificate already exists for this course enrollment.');
      }

      return tx.enrollmentCertificate.create({
        data: {
          certificateCode,
          tenantId,
          userId,
          enrollmentId,
          courseId,
          courseVersion,
          verificationToken,
          issuedBy,
        }
      });
    });
  }

  public async getCertificate(id: string, tenantId: string) {
    return prisma.enrollmentCertificate.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { course: true, user: true }
    });
  }

  public async getLearnerCertificates(userId: string, tenantId: string) {
    return prisma.enrollmentCertificate.findMany({
      where: { userId, tenantId, deletedAt: null },
      include: { course: true },
      orderBy: { issuedAt: 'desc' }
    });
  }

  public async revokeCertificate(id: string, tenantId: string, revokedBy: string, revocationReason: string) {
    const cert = await prisma.enrollmentCertificate.findFirst({
      where: { id, tenantId, deletedAt: null }
    });
    
    if (!cert) throw new NotFoundError('Certificate not found');

    return prisma.enrollmentCertificate.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revokedBy,
        revokedAt: new Date(),
        revocationReason,
      }
    });
  }

  public async verifyToken(token: string) {
    return prisma.enrollmentCertificate.findFirst({
      where: { verificationToken: token, deletedAt: null },
      select: {
        certificateCode: true,
        issuedAt: true,
        status: true,
        user: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
        tenant: { select: { name: true } }
      }
    });
  }
}

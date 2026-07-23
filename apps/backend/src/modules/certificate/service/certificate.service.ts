import { CertificateRepository } from '../repository/certificate.repository';
import { RevokeCertificateDto } from '../dto/certificate.dto';
import { logger } from '../../../shared/logger';
import { ValidationError, NotFoundError, ConflictError } from '../../../shared/errors';
import crypto from 'crypto';

export class CertificateService {
  private certificateRepository: CertificateRepository;

  constructor() {
    this.certificateRepository = new CertificateRepository();
  }

  /**
   * Reusable issueCertificate method designed for future Event-Bus/BullMQ invocation.
   * TODO: Connect this to `LearnerService.updateProgress` via an Event Emitter once RabbitMQ/BullMQ is introduced.
   */
  public async issueCertificate(enrollmentId: string, tenantId: string, issuedBy: string) {
    // 1. Validate Enrollment & Tenant Isolation
    const enrollment = await this.certificateRepository.getEnrollmentForIssuance(enrollmentId, tenantId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found or does not belong to your tenant.');
    }

    // 2. Validate strict completion business rules
    if (enrollment.status !== 'COMPLETED') {
      throw new ValidationError('Certificates can only be issued when Enrollment status is COMPLETED.');
    }

    const completedCourse = enrollment.courses.find(c => c.status === 'COMPLETED');
    if (!completedCourse) {
      throw new ValidationError('No fully completed course found inside this enrollment.');
    }

    // 3. Prevent Duplicates
    const existing = await this.certificateRepository.checkExistingCertificate(enrollmentId, completedCourse.courseId);
    if (existing) {
      throw new ConflictError('An active certificate already exists for this enrollment.');
    }

    // 4. Cryptographic Token Generation
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 5. Issue Atomically
    const certificate = await this.certificateRepository.issueCertificate(
      tenantId,
      enrollment.userId,
      enrollmentId,
      completedCourse.courseId,
      completedCourse.courseVersion,
      verificationToken,
      issuedBy
    );

    logger.info(`Certificate Issued: ${certificate.certificateCode} for Enrollment ${enrollmentId}`);
    return certificate;
  }

  public async getMyCertificates(userId: string, tenantId: string) {
    return this.certificateRepository.getLearnerCertificates(userId, tenantId);
  }

  public async revokeCertificate(id: string, tenantId: string, revokedBy: string, data: RevokeCertificateDto) {
    const cert = await this.certificateRepository.revokeCertificate(id, tenantId, revokedBy, data.revocationReason);
    logger.info(`Certificate Revoked: ${cert.certificateCode} by User ${revokedBy}. Reason: ${data.revocationReason}`);
    return cert;
  }

  public async verifyPublicToken(token: string) {
    const cert = await this.certificateRepository.verifyToken(token);
    if (!cert) {
      throw new NotFoundError('Invalid verification token or certificate not found.');
    }
    return cert;
  }
}

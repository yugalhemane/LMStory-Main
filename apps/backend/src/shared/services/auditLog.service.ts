import { prisma } from '../../database/prisma';
import { logger } from '../logger';

export class AuditLogService {
  /**
   * Records an audit log entry.
   * This is generic and decoupled, using the AuditLog model.
   */
  public async log(payload: {
    tenantId?: string;
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: payload.tenantId || null,
          userId: payload.userId || null,
          action: payload.action,
          entityType: payload.entityType || null,
          entityId: payload.entityId || null,
          ipAddress: payload.ipAddress || null,
          userAgent: payload.userAgent || null,
          metadata: payload.metadata || {},
        },
      });
    } catch (error) {
      logger.error('Failed to write audit log', error);
      // We explicitly do not throw here, because audit logging failure 
      // should generally not abort the parent transaction unless strictly required.
    }
  }
}

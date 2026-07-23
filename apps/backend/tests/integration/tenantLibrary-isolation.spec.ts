import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { prismaMock } from '../setup';
import tenantLibraryRoutes from '../../src/modules/tenantLibrary/routes/tenantLibrary.routes';
import { Role } from '@prisma/client';
import { errorHandler } from '../../src/middlewares/errorHandler';

const app = express();
app.use(express.json());

// Mock requireAuth to inject a Tenant A admin user
jest.mock('../../src/modules/auth/middleware/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = {
      userId: 'admin-a',
      tenantId: 'tenant-A',
      role: Role.TENANT_ADMIN
    };
    next();
  }
}));

app.use('/api/tenant-library', tenantLibraryRoutes);
app.use(errorHandler);

describe('Tenant Library Isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Tenant A admin cannot fetch Tenant B library item', async () => {
    prismaMock.tenantLibrary.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/tenant-library/lib-b-id');
    
    // Service throws NotFoundError, translating to 404
    expect(res.status).toBe(404);
    expect(prismaMock.tenantLibrary.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'lib-b-id', tenantId: 'tenant-A', deletedAt: null }
      })
    );
  });

  it('Tenant A admin cannot update Tenant B library overrides', async () => {
    prismaMock.tenantLibrary.findFirst.mockResolvedValue(null);

    const res = await request(app).patch('/api/tenant-library/lib-b-id').send({ customTitle: 'New Title' });
    
    expect(res.status).toBe(404);
    expect(prismaMock.tenantLibrary.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'lib-b-id', tenantId: 'tenant-A', deletedAt: null }
      })
    );
  });

  it('Tenant A admin cannot import already imported content from Global Library', async () => {
    const validUuid = '0a61d8a1-8d26-4074-b5b6-71d1887e3db2';
    // 1. Mock global content exists
    prismaMock.libraryContent.findFirst.mockResolvedValue({
      id: validUuid,
      status: 'PUBLISHED',
      assets: []
    } as any);

    // 2. Mock that the import record already exists for this tenant
    prismaMock.tenantLibraryImport.findUnique.mockResolvedValue({ id: 'import-id' } as any);

    const res = await request(app).post('/api/tenant-library/import').send({ globalLibraryContentId: validUuid });
    
    expect(res.status).toBe(409); // ConflictError
    expect(prismaMock.tenantLibraryImport.findUnique).toHaveBeenCalledWith({
      where: { tenantId_globalLibraryContentId: { tenantId: 'tenant-A', globalLibraryContentId: validUuid } }
    });
  });
});

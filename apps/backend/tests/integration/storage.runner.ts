import { PrismaClient } from '@prisma/client';
import { getStorageProvider } from '../../src/shared/storage';
import { TenantLibraryService } from '../../src/modules/tenantLibrary/service/tenantLibrary.service';

const prisma = new PrismaClient();
const storage = getStorageProvider();
const tenantLibraryService = new TenantLibraryService();

async function runTest() {
  console.log('--- STARTING STORAGE INTEGRATION TEST ---');
  let tenantAId: string = '';
  let tenantBId: string = '';
  let libraryIdA: string = '';
  let adminAId: string = '';
  let objectKey: string = '';

  try {
    // 1. Setup Test Tenants and Users
    const tenantA = await prisma.tenant.create({
      data: { name: 'Storage Tenant A', slug: 'storage-ta', domain: 'storage-ta.com', code: 'STA' }
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: { name: 'Storage Tenant B', slug: 'storage-tb', domain: 'storage-tb.com', code: 'STB' }
    });
    tenantBId = tenantB.id;

    const adminEmail = `admin-${Date.now()}@storage-ta.com`;
    const adminA = await prisma.user.create({
      data: { 
        email: adminEmail, 
        passwordHash: 'hash', 
        role: 'TENANT_ADMIN', 
        tenantId: tenantAId,
        firstName: 'Admin',
        lastName: 'A'
      }
    });
    adminAId = adminA.id;

    const libraryA = await prisma.tenantLibrary.create({
      data: { 
        tenantId: tenantAId, 
        title: 'T1 Library Asset', 
        slug: 't1-lib',
        contentType: 'VIDEO',
        difficulty: 'BEGINNER'
      }
    });
    libraryIdA = libraryA.id;

    console.log('✓ Test data setup complete');

    // 2. Generate Presigned URL
    const testBytes = Buffer.from('harmless deterministic test bytes for exact equality verification', 'utf8');
    const res = await tenantLibraryService.presignUpload(libraryIdA, tenantAId, {
      fileName: 'test.mp4',
      fileType: 'video/mp4',
      fileSize: testBytes.length
    }, adminAId);

    if (!res.uploadUrl.includes('localhost:9000')) throw new Error('Upload URL missing endpoint');
    if (!res.objectKey.includes(`tenants/${tenantAId}/`)) throw new Error('Tenant isolation missing in objectKey');
    objectKey = res.objectKey;
    
    // Verify PostgreSQL PENDING record
    const asset = await prisma.tenantLibraryAsset.findFirst({ where: { objectKey } });
    if (!asset || asset.uploadStatus !== 'PENDING') throw new Error('PENDING record not created');

    console.log('✓ Presigned PUT and PENDING record verified');

    // 3. Upload object via fetch
    const uploadRes = await fetch(res.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: testBytes
    });
    if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);

    console.log('✓ Object uploaded to MinIO');

    // 4. Confirm upload
    const confirmedRes = await tenantLibraryService.confirmUpload(libraryIdA, tenantAId, {
      objectKey,
      name: 'test.mp4'
    }, adminAId);
    if (confirmedRes.uploadStatus !== 'CONFIRMED') throw new Error('Upload not confirmed');

    console.log('✓ Upload confirmed (HeadObject verification passed)');

    // 5. Security Check: Tenant B cannot confirm Tenant A asset
    try {
      await tenantLibraryService.confirmUpload(libraryIdA, tenantBId, { objectKey, name: 'test.mp4' }, 'user-b');
      throw new Error('Tenant B was able to access Tenant A asset!');
    } catch (e: any) {
      if (e.message !== 'Library item not found') throw e;
    }
    console.log('✓ Security: Tenant B access denied');

    // 6. Generate playback URL
    const getUrl = await storage.createReadUrl(objectKey, 60);
    const downloadRes = await fetch(getUrl);
    if (!downloadRes.ok) throw new Error('Failed to download object');
    
    const downloadedBuffer = Buffer.from(await downloadRes.arrayBuffer());
    if (!testBytes.equals(downloadedBuffer)) {
      throw new Error(`Byte mismatch! Uploaded: ${testBytes.length}, Downloaded: ${downloadedBuffer.length}`);
    }
    
    console.log('✓ Presigned GET and playback successful');
    console.log(`✓ EXACT BYTE EQUALITY VERIFIED. Uploaded: ${testBytes.length} bytes, Downloaded: ${downloadedBuffer.length} bytes.`);

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    // Clean up
    if (tenantAId !== '' || tenantBId !== '') {
      await prisma.user.deleteMany({
        where: { email: { startsWith: 'admin-' } }
      });
      await prisma.tenant.deleteMany({
        where: { slug: { in: ['storage-ta', 'storage-tb'] } }
      });
    }
    await prisma.$disconnect();
    console.log('--- STORAGE INTEGRATION TEST COMPLETE ---');
  }
}

runTest();

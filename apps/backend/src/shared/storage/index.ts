import { StorageProvider } from './storage.provider';
import { S3StorageProvider } from './s3.storage';
import { MockStorageProvider } from './mock.storage';
import { env } from '../../config/env';

let storageInstance: StorageProvider;

export const getStorageProvider = (): StorageProvider => {
  if (!storageInstance) {
    if (env.STORAGE_PROVIDER === 's3') {
      storageInstance = new S3StorageProvider();
    } else {
      // In production, Zod env refinement will block 'mock', so this is safe.
      storageInstance = new MockStorageProvider();
    }
  }
  return storageInstance;
};

import { StorageProvider } from './storage.provider.interface';
import { LocalStorageProvider } from './local.storage.provider';
import { S3StorageProvider } from './s3.storage.provider';
import { logger } from '../logger';

export class StorageFactory {
  private static instance: StorageProvider;

  static getProvider(): StorageProvider {
    if (!this.instance) {
      const providerType = process.env.STORAGE_PROVIDER?.toUpperCase() || 'LOCAL';
      
      switch (providerType) {
        case 'S3':
          this.instance = new S3StorageProvider();
          logger.info('Initialized S3StorageProvider');
          break;
        case 'LOCAL':
        default:
          this.instance = new LocalStorageProvider();
          logger.info('Initialized LocalStorageProvider');
          break;
      }
    }
    return this.instance;
  }
}

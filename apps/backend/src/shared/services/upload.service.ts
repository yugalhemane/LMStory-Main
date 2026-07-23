import { StorageFactory } from '../storage/storage.factory';
import { StorageProvider } from '../storage/storage.provider.interface';

export class UploadService {
  private storageProvider: StorageProvider;

  constructor() {
    this.storageProvider = StorageFactory.getProvider();
  }

  public async uploadFile(path: string, buffer: Buffer, mimetype: string): Promise<string> {
    return this.storageProvider.upload(path, buffer, mimetype);
  }

  public async deleteFile(path: string): Promise<void> {
    return this.storageProvider.delete(path);
  }

  public async fileExists(path: string): Promise<boolean> {
    return this.storageProvider.exists(path);
  }

  public async downloadFile(path: string): Promise<Buffer> {
    return this.storageProvider.download(path);
  }

  public getPublicUrl(path: string): string {
    return this.storageProvider.getPublicUrl(path);
  }
}

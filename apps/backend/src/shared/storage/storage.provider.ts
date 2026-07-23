export interface StorageProvider {
  createUploadUrl(key: string, contentType: string, maxSize: number): Promise<string>;
  verifyObject(key: string): Promise<{ size: number; contentType: string } | null>;
  createReadUrl(key: string, expiresInSeconds: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

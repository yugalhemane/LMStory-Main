export interface StorageProvider {
  upload(filePath: string, fileBuffer: Buffer, mimetype: string): Promise<string>;
  delete(filePath: string): Promise<void>;
  exists(filePath: string): Promise<boolean>;
  download(filePath: string): Promise<Buffer>;
  getPublicUrl(filePath: string): string;
}

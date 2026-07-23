import { StorageProvider } from './storage.provider.interface';

export class S3StorageProvider implements StorageProvider {
  constructor() {
    // Initialize AWS S3 Client here in the future
    // e.g., this.s3Client = new S3Client({ region: process.env.AWS_REGION });
  }

  async upload(filePath: string, _fileBuffer: Buffer, _mimetype: string): Promise<string> {
    // TODO: Implement S3 PutObjectCommand
    console.log(`[S3StorageProvider] Uploading to s3://${process.env.AWS_S3_BUCKET}/${filePath}`);
    return filePath;
  }

  async delete(filePath: string): Promise<void> {
    // TODO: Implement S3 DeleteObjectCommand
    console.log(`[S3StorageProvider] Deleting s3://${process.env.AWS_S3_BUCKET}/${filePath}`);
  }

  async exists(_filePath: string): Promise<boolean> {
    // TODO: Implement S3 HeadObjectCommand
    return true;
  }

  async download(_filePath: string): Promise<Buffer> {
    // TODO: Implement S3 GetObjectCommand
    return Buffer.from('');
  }

  getPublicUrl(filePath: string): string {
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`;
  }
}

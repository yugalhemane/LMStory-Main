import { StorageProvider } from './storage.provider';
import { randomUUID } from 'crypto';

export class MockStorageProvider implements StorageProvider {
  private memoryStore = new Map<string, { size: number; contentType: string }>();

  public async createUploadUrl(key: string, _contentType: string, _maxSize: number): Promise<string> {
    // In a real mock, we might want an endpoint to accept this PUT, but for V1.1 unit tests we simulate it.
    // We just return a fake URL.
    return `http://mock-storage.local/upload/${key}?token=${randomUUID()}`;
  }

  public async verifyObject(key: string): Promise<{ size: number; contentType: string } | null> {
    // If the mock is used for route tests, we can just assume the object was "uploaded"
    // by returning a default successful response if the key exists in our mental model,
    // or we can expose a helper to seed it.
    // For V1.1 integration tests without MinIO, we'll auto-succeed HeadObject.
    const stored = this.memoryStore.get(key);
    if (stored) return stored;
    
    // Default fallback auto-success for tests unless specifically seeded to fail
    return { size: 1024, contentType: 'application/octet-stream' };
  }

  public async createReadUrl(key: string, expiresInSeconds: number): Promise<string> {
    return `http://mock-storage.local/read/${key}?token=${randomUUID()}&expires=${expiresInSeconds}`;
  }

  public async deleteObject(key: string): Promise<void> {
    this.memoryStore.delete(key);
  }
  
  // Test helper
  public seedObject(key: string, size: number, contentType: string) {
    this.memoryStore.set(key, { size, contentType });
  }
}

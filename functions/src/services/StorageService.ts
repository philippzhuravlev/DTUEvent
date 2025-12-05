import { Bucket } from '@google-cloud/storage';
import fetch from 'node-fetch';
import { extension } from 'mime-types';

export class StorageService {
  // think of a bucket as a folder in cloud storage
  constructor(private bucket: Bucket) {} // dependency injection thru constructor

  async addImage(filePath: string, data: Buffer, contentType: string): Promise<string> {
    const file = this.bucket.file(filePath);

    await file.save(data, { metadata: { contentType } });
    await file.makePublic();

    const encodedPath = encodeURIComponent(filePath); // encode special characters in the file path
    return `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodedPath}?alt=media`;
  }

  async addImageFromUrl(filePath: string, sourceUrl: string): Promise<string> {
    // 1. get the image from the source URL
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to get image from ${sourceUrl}: ${response.statusText}`);
    }

    // 2. determine content type and file extension
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // 3. convert response to "buffer", i.e. raw binary data
    const arrayBuffer = await response.arrayBuffer(); // arraybuffer is a generic binary data format
    const buffer = Buffer.from(arrayBuffer);
    
    // 4. determine file extension from content type
    const ext = extension(contentType) || '';
    const finalFilePath = ext ? `${filePath}.${ext}` : filePath;

    return this.addImage(finalFilePath, buffer, contentType);
  }

  async getImage(filePath: string): Promise<string | null> {
    const file = this.bucket.file(filePath);
    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }

    const encodedPath = encodeURIComponent(filePath); // encode special characters again
    return `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodedPath}?alt=media`;
  }

  async removeImage(filePath: string): Promise<void> {
    const file = this.bucket.file(filePath);
    await file.delete();
  }
}

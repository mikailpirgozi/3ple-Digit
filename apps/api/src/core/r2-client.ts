import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import { env } from './env';
import { log } from './logger';

// Initialize S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for R2
});

export interface UploadMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  sha256?: string;
}

export interface PresignedUploadData {
  uploadUrl: string;
  r2Key: string;
  publicUrl: string;
  expiresAt: Date;
}

export class R2Service {
  private readonly bucketName = env.R2_BUCKET_NAME;
  private readonly publicUrl = env.R2_PUBLIC_URL;

  /**
   * Generate a presigned URL for direct upload to R2
   */
  async generatePresignedUpload(
    metadata: UploadMetadata,
    expiresInMinutes = 15
  ): Promise<PresignedUploadData> {
    try {
      // Generate unique key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const extension = this.getFileExtension(metadata.originalName);
      const r2Key = `uploads/${timestamp}-${randomSuffix}${extension}`;

      // In development mode without R2 credentials, return a mock URL
      if (env.R2_ACCOUNT_ID === 'test-account-id' || 
          env.R2_ACCESS_KEY_ID === 'test-access-key' ||
          env.R2_ACCOUNT_ID === 'your-r2-account-id' ||
          env.R2_ACCESS_KEY_ID === 'your-r2-access-key-id') {
        log.warn('Using mock R2 service for development (no real R2 credentials)', {
          r2Key,
          mimeType: metadata.mimeType,
          size: metadata.size,
        });

        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        const publicUrl = `${this.publicUrl}/${r2Key}`;

        return {
          uploadUrl: `https://mock-upload-url.com/upload?key=${r2Key}`,
          r2Key,
          publicUrl,
          expiresAt,
        };
      }

      // Create presigned URL without ContentLength to avoid checksum
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: r2Key,
        ContentType: metadata.mimeType,
        // Remove ContentLength to prevent automatic checksum generation
        Metadata: {
          originalName: metadata.originalName,
          uploadedAt: new Date().toISOString(),
        },
      });

      // Generate presigned URL
      let uploadUrl = await getSignedUrl(r2Client, command, {
        expiresIn: expiresInMinutes * 60,
      });

      // Manually remove problematic parameters that cause CORS issues
      uploadUrl = uploadUrl.replace(/&x-id=PutObject/g, '');
      uploadUrl = uploadUrl.replace(/&x-amz-sdk-checksum-algorithm=[^&]*/g, '');
      uploadUrl = uploadUrl.replace(/&x-amz-checksum-[^&]*=[^&]*/g, '');

      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
      const publicUrl = `${this.publicUrl}/${r2Key}`;

      log.info('Generated presigned upload URL', {
        r2Key,
        mimeType: metadata.mimeType,
        size: metadata.size,
        expiresAt,
      });

      return {
        uploadUrl,
        r2Key,
        publicUrl,
        expiresAt,
      };
    } catch (error) {
      log.error('Failed to generate presigned upload URL', {
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata,
      });
      throw error;
    }
  }

  /**
   * Generate a presigned URL for downloading from R2
   */
  async generatePresignedDownload(
    r2Key: string,
    expiresInMinutes = 60
  ): Promise<string> {
    try {
      // In development mode without R2 credentials, return mock URL
      if (env.R2_ACCOUNT_ID === 'test-account-id' || 
          env.R2_ACCESS_KEY_ID === 'test-access-key' ||
          env.R2_ACCOUNT_ID === 'your-r2-account-id' ||
          env.R2_ACCESS_KEY_ID === 'your-r2-access-key-id') {
        log.warn('Using mock download URL for development (no real R2 credentials)', {
          r2Key,
          expiresInMinutes,
        });
        return `https://mock-download-url.com/download?key=${r2Key}`;
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: r2Key,
      });

      const downloadUrl = await getSignedUrl(r2Client, command, {
        expiresIn: expiresInMinutes * 60,
      });

      log.debug('Generated presigned download URL', {
        r2Key,
        expiresInMinutes,
      });

      return downloadUrl;
    } catch (error) {
      log.error('Failed to generate presigned download URL', {
        error: error instanceof Error ? error.message : 'Unknown error',
        r2Key,
      });
      throw error;
    }
  }

  /**
   * Delete object from R2
   */
  async deleteObject(r2Key: string): Promise<void> {
    try {
      // In development mode without R2 credentials, skip R2 deletion
      if (env.R2_ACCOUNT_ID === 'test-account-id' || 
          env.R2_ACCESS_KEY_ID === 'test-access-key' ||
          env.R2_ACCOUNT_ID === 'your-r2-account-id' ||
          env.R2_ACCESS_KEY_ID === 'your-r2-access-key-id') {
        log.warn('Skipping R2 deletion in development mode (no real R2 credentials)', {
          r2Key,
        });
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: r2Key,
      });

      await r2Client.send(command);

      log.info('Deleted object from R2', { r2Key });
    } catch (error) {
      log.error('Failed to delete object from R2', {
        error: error instanceof Error ? error.message : 'Unknown error',
        r2Key,
      });
      throw error;
    }
  }

  /**
   * Calculate SHA256 hash of file buffer
   */
  calculateSHA256(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }

  /**
   * Validate file type and size
   */
  validateFile(metadata: UploadMetadata): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (metadata.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }

    if (!allowedTypes.includes(metadata.mimeType)) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const r2Service = new R2Service();

import { errors } from '@/core/error-handler';
import { log } from '@/core/logger';
import { prisma } from '@/core/prisma';
import { r2Service } from '@/core/r2-client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@/core/env';
// Document type removed as not exported from @prisma/client
import crypto from 'crypto';
import type {
  CreateDocumentRequest,
  DocumentResponse,
  GetDocumentsQuery,
  GetPresignedUploadUrlRequest,
  PresignedDownloadResponse,
  PresignedUploadResponse,
  UpdateDocumentRequest,
} from './schema';

export class DocumentsService {
  /**
   * Helper function to convert undefined to null for Prisma compatibility
   */
  private toNullable<T>(value: T | undefined): T | null {
    return value ?? null;
  }

  /**
   * Helper function to filter out undefined values from update data
   */
  private filterUpdateData<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (filtered as Record<string, unknown>)[key] = value;
      }
    }
    return filtered;
  }

  /**
   * Get presigned URL for file upload
   */
  async getPresignedUploadUrl(
    data: GetPresignedUploadUrlRequest,
    userId?: string
  ): Promise<PresignedUploadResponse> {
    // Generate unique R2 key
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const fileExtension = data.fileName.split('.').pop() ?? '';
    // Generate unique R2 key for the document (unused in current implementation)
    // const r2Key = `documents/${timestamp}-${randomId}.${fileExtension}`;

    // Remove unused variables to fix TypeScript warnings
    void timestamp;
    void randomId;
    void fileExtension;

    try {
      // Generate presigned URL for upload using r2Service
      const uploadData = await r2Service.generatePresignedUpload({
        originalName: data.fileName,
        mimeType: data.fileType,
        size: data.fileSize,
      });

      log.info('Presigned upload URL generated', {
        r2Key: uploadData.r2Key,
        fileName: data.fileName,
        fileSize: data.fileSize,
        requestedBy: userId,
      });

      return {
        uploadUrl: uploadData.uploadUrl,
        r2Key: uploadData.r2Key,
        expiresAt: uploadData.expiresAt,
        fields: {},
        document: {
          id: '',
          name: data.fileName,
          originalName: data.fileName,
          linkedType: data.linkedType ?? null,
          linkedId: data.linkedId ?? null,
          description: null,
          r2Key: uploadData.r2Key,
          mimeType: data.fileType,
          size: data.fileSize,
          sha256: null,
          category: null,
          uploadedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      log.error('Failed to generate presigned upload URL', {
        error,
        fileName: data.fileName,
        userId,
      });
      throw errors.internal('Failed to generate upload URL');
    }
  }

  /**
   * Create document record after successful upload
   */
  async createDocument(
    data: CreateDocumentRequest,
    r2Key: string,
    userId?: string
  ): Promise<DocumentResponse> {
    const document = await prisma.document.create({
      data: {
        name: data.name,
        originalName: data.originalName,
        r2Key,
        mimeType: data.mimeType,
        size: data.size,
        category: this.toNullable(data.category),
        description: this.toNullable(data.description),
        linkedType: this.toNullable(data.linkedType),
        linkedId: this.toNullable(data.linkedId),
        uploadedBy: this.toNullable(userId),
      },
    });

    log.info('Document created', { documentId: document.id, r2Key, createdBy: userId });

    return this.formatDocumentResponse(document);
  }

  /**
   * Get all documents with pagination and filtering
   */
  async getDocuments(query: GetDocumentsQuery): Promise<{
    documents: DocumentResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalSize: number;
      totalCount: number;
      byCategory: Record<string, number>;
      byMimeType: Record<string, number>;
    };
  }> {
    const { page, limit, search, category, mimeType, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (mimeType) {
      where.mimeType = { contains: mimeType, mode: 'insensitive' };
    }

    // Get total count and documents
    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    // Calculate summary
    const allDocuments = await prisma.document.findMany({ where });
    const totalSize = allDocuments.reduce((sum, doc) => sum + doc.size, 0);

    const byCategory = allDocuments.reduce(
      (acc, doc) => {
        const cat = doc.category ?? 'uncategorized';
        acc[cat] = (acc[cat] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byMimeType = allDocuments.reduce(
      (acc, doc) => {
        acc[doc.mimeType] = (acc[doc.mimeType] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      documents: documents.map(doc => this.formatDocumentResponse(doc)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalSize,
        totalCount: allDocuments.length,
        byCategory,
        byMimeType,
      },
    };
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string): Promise<DocumentResponse> {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw errors.notFound('Document not found');
    }

    return this.formatDocumentResponse(document);
  }

  /**
   * Get presigned URL for file download
   */
  async getPresignedDownloadUrl(id: string, userId?: string): Promise<PresignedDownloadResponse> {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw errors.notFound('Document not found');
    }

    try {
      const downloadUrl = await r2Service.generatePresignedDownload(document.r2Key, 60); // 1 hour

      log.info('Presigned download URL generated', {
        documentId: id,
        r2Key: document.r2Key,
        requestedBy: userId,
      });

      return {
        downloadUrl,
        expiresIn: 3600,
      };
    } catch (error) {
      log.error('Failed to generate presigned download URL', { error, documentId: id, userId });
      throw errors.internal('Failed to generate download URL');
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    id: string,
    data: UpdateDocumentRequest,
    userId?: string
  ): Promise<DocumentResponse> {
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      throw errors.notFound('Document not found');
    }

    const updateData = this.filterUpdateData({
      ...data,
      category: data.category !== undefined ? this.toNullable(data.category) : undefined,
      description: data.description !== undefined ? this.toNullable(data.description) : undefined,
    });

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    log.info('Document updated', { documentId: id, updatedBy: userId });

    return this.formatDocumentResponse(document);
  }

  /**
   * Delete document (removes from R2 and database)
   */
  async deleteDocument(id: string, userId?: string): Promise<void> {
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      throw errors.notFound('Document not found');
    }

    try {
      // Delete from R2
      await r2Service.deleteObject(existingDocument.r2Key);

      // Delete from database
      await prisma.document.delete({
        where: { id },
      });

      log.info('Document deleted', {
        documentId: id,
        r2Key: existingDocument.r2Key,
        deletedBy: userId,
      });
    } catch (error) {
      log.error('Failed to delete document', { error, documentId: id, userId });
      throw errors.internal('Failed to delete document');
    }
  }

  /**
   * Get document categories
   */
  async getDocumentCategories(): Promise<string[]> {
    const result = await prisma.document.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    });

    return result
      .map(doc => doc.category)
      .filter((category): category is string => category !== null)
      .sort();
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalDocuments: number;
    totalSize: number;
    averageSize: number;
    largestDocument: { name: string; size: number } | null;
    recentUploads: DocumentResponse[];
  }> {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const totalDocuments = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const averageSize = totalDocuments > 0 ? totalSize / totalDocuments : 0;

    const largestDocument =
      documents.length > 0
        ? documents.reduce((largest, doc) => (doc.size > largest.size ? doc : largest))
        : null;

    const recentUploads = documents.slice(0, 5).map(doc => this.formatDocumentResponse(doc));

    return {
      totalDocuments,
      totalSize,
      averageSize,
      largestDocument: largestDocument
        ? {
            name: largestDocument.name,
            size: largestDocument.size,
          }
        : null,
      recentUploads,
    };
  }

  /**
   * Format document response
   */
  private formatDocumentResponse(document: Record<string, unknown>): DocumentResponse {
    return {
      id: document.id as string,
      name: document.name as string,
      originalName: document.originalName as string,
      r2Key: document.r2Key as string,
      mimeType: document.mimeType as string,
      size: document.size as number,
      sha256: document.sha256 as string,
      category: document.category as string,
      description: document.description as string | null,
      linkedType: document.linkedType as string | null,
      linkedId: document.linkedId as string | null,
      uploadedBy: document.uploadedBy as string,
      createdAt: document.createdAt as Date,
      updatedAt: document.updatedAt as Date,
    };
  }

  /**
   * Upload file through backend proxy (avoids CORS issues)
   */
  async uploadFileProxy(
    data: {
      file: Buffer;
      fileName: string;
      mimeType: string;
      size: number;
      linkedType?: string;
      linkedId?: string;
      note?: string;
    },
    userId?: string
  ): Promise<DocumentResponse> {
    try {
      log.info('Starting proxy file upload', {
        fileName: data.fileName,
        mimeType: data.mimeType,
        size: data.size,
        userId,
      });

      // Generate unique key for R2
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const extension = data.fileName.substring(data.fileName.lastIndexOf('.'));
      const r2Key = `uploads/${timestamp}-${randomSuffix}${extension}`;

      // Initialize S3 client for R2
      const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });

      // Upload directly to R2
      const putCommand = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: r2Key,
        Body: data.file,
        ContentType: data.mimeType,
        ContentLength: data.size,
      });

      await r2Client.send(putCommand);

      log.info('File uploaded to R2 successfully', { r2Key });

      // Calculate SHA256 hash
      const sha256 = crypto.createHash('sha256').update(data.file).digest('hex');

      // Create document record in database
      const document = await prisma.document.create({
        data: {
          name: data.fileName,
          originalName: data.fileName,
          mimeType: data.mimeType,
          size: data.size,
          r2Key,
          sha256,
          category: 'other',
          linkedType: this.toNullable(data.linkedType),
          linkedId: this.toNullable(data.linkedId),
          description: this.toNullable(data.note),
          uploadedBy: userId || 'system',
        },
      });

      log.info('Document record created', { documentId: document.id });

      return {
        id: document.id,
        name: document.name,
        originalName: document.originalName,
        mimeType: document.mimeType,
        size: document.size,
        r2Key: document.r2Key,
        sha256: document.sha256 as string | null,
        category: document.category as string,
        description: document.description as string | null,
        uploadedBy: document.uploadedBy as string,
        createdAt: document.createdAt as Date,
        updatedAt: document.updatedAt as Date,
      } as DocumentResponse;
    } catch (error) {
      log.error('Failed to upload file through proxy', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fileName: data.fileName,
      });
      throw errors.internal('Failed to upload file');
    }
  }
}

export const documentsService = new DocumentsService();

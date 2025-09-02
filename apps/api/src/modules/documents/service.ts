import { prisma } from '@/core/prisma.js';
import { r2Service } from '@/core/r2-client.js';
import { errors } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import crypto from 'crypto';
import type {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  GetPresignedUploadUrlRequest,
  GetDocumentsQuery,
  DocumentResponse,
  PresignedUploadResponse,
  PresignedDownloadResponse,
} from './schema.js';

export class DocumentsService {
  /**
   * Helper function to convert undefined to null for Prisma compatibility
   */
  private toNullable<T>(value: T | undefined): T | null {
    return value === undefined ? null : value;
  }

  /**
   * Helper function to filter out undefined values from update data
   */
  private filterUpdateData<T extends Record<string, any>>(data: T): any {
    const filtered: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (filtered as any)[key] = value;
      }
    }
    return filtered;
  }

  /**
   * Get presigned URL for file upload
   */
  async getPresignedUploadUrl(data: GetPresignedUploadUrlRequest, userId?: string): Promise<PresignedUploadResponse> {
    // Generate unique R2 key
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const fileExtension = data.fileName.split('.').pop() || '';
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
        requestedBy: userId 
      });

      return {
        uploadUrl: uploadData.uploadUrl,
        r2Key: uploadData.r2Key,
      };
    } catch (error) {
      log.error('Failed to generate presigned upload URL', { error, fileName: data.fileName, userId });
      throw errors.internal('Failed to generate upload URL');
    }
  }

  /**
   * Create document record after successful upload
   */
  async createDocument(data: CreateDocumentRequest, r2Key: string, userId?: string): Promise<DocumentResponse> {
    const document = await prisma.document.create({
      data: {
        name: data.name,
        originalName: data.originalName,
        r2Key,
        mimeType: data.mimeType,
        size: data.size,
        category: this.toNullable(data.category),
        description: this.toNullable(data.description),
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
    const where: any = {};
    
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
    
    const byCategory = allDocuments.reduce((acc, doc) => {
      const cat = doc.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byMimeType = allDocuments.reduce((acc, doc) => {
      acc[doc.mimeType] = (acc[doc.mimeType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
        requestedBy: userId 
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
  async updateDocument(id: string, data: UpdateDocumentRequest, userId?: string): Promise<DocumentResponse> {
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
        deletedBy: userId 
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
    
    const largestDocument = documents.length > 0 
      ? documents.reduce((largest, doc) => doc.size > largest.size ? doc : largest)
      : null;

    const recentUploads = documents
      .slice(0, 5)
      .map(doc => this.formatDocumentResponse(doc));

    return {
      totalDocuments,
      totalSize,
      averageSize,
      largestDocument: largestDocument ? {
        name: largestDocument.name,
        size: largestDocument.size,
      } : null,
      recentUploads,
    };
  }

  /**
   * Format document response
   */
  private formatDocumentResponse(document: any): DocumentResponse {
    return {
      id: document.id,
      name: document.name,
      originalName: document.originalName,
      r2Key: document.r2Key,
      mimeType: document.mimeType,
      size: document.size,
      sha256: document.sha256,
      category: document.category,
      description: document.description,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}

export const documentsService = new DocumentsService();

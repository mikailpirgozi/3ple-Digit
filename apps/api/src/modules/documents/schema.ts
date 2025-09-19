import { z } from 'zod';

// Document schemas
export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().int().min(1, 'Size must be positive'),
  category: z.string().optional(),
  description: z.string().optional(),
  linkedType: z.enum(['asset', 'investor', 'liability']).optional(),
  linkedId: z.string().optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

// Presigned URL request schemas
export const getPresignedUploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().int().min(1, 'File size must be positive'),
  category: z.string().optional(),
  linkedType: z.enum(['asset', 'investor', 'liability']).optional(),
  linkedId: z.string().optional(),
});

// Query schemas
export const getDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  mimeType: z.string().optional(),
  sortBy: z.enum(['name', 'originalName', 'size', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Response schemas
export const documentResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  originalName: z.string(),
  r2Key: z.string(),
  mimeType: z.string(),
  size: z.number(),
  sha256: z.string().nullable(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  linkedType: z.string().nullable(),
  linkedId: z.string().nullable(),
  uploadedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  downloadUrl: z.string().optional(),
});

export const presignedUploadResponseSchema = z.object({
  uploadUrl: z.string(),
  r2Key: z.string(),
  expiresAt: z.date(),
  fields: z.record(z.string()).optional(),
  document: documentResponseSchema,
});

export const presignedDownloadResponseSchema = z.object({
  downloadUrl: z.string(),
  expiresIn: z.number(),
});

// Types
export type CreateDocumentRequest = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentRequest = z.infer<typeof updateDocumentSchema>;
export type GetPresignedUploadUrlRequest = z.infer<typeof getPresignedUploadUrlSchema>;
export type GetDocumentsQuery = z.infer<typeof getDocumentsQuerySchema>;
export type DocumentResponse = z.infer<typeof documentResponseSchema>;
export type PresignedUploadResponse = z.infer<typeof presignedUploadResponseSchema>;
export type PresignedDownloadResponse = z.infer<typeof presignedDownloadResponseSchema>;

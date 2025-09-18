/**
 * Shared Zod validators for 3ple Digit
 * MANDATORY: Use these for consistent validation across the app
 */

import { z } from 'zod';

/**
 * Common ID parameter validation
 */
export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

/**
 * Pagination query schema
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Date range query schema
 */
export const DateRangeQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

/**
 * Money validation - always string to avoid float issues
 */
export const MoneySchema = z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid money format');

/**
 * Percentage validation (0-100)
 */
export const PercentageSchema = z.number().min(0).max(100);

/**
 * File upload validation
 */
export const FileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_.]*$/),
  size: z
    .number()
    .int()
    .min(1)
    .max(50 * 1024 * 1024), // 50MB max
});

/**
 * Search query validation
 */
export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100).optional(),
  filters: z.record(z.string()).optional(),
});

/**
 * Paginated response schema
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

/**
 * Error response schema
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().nullable().optional(),
  }),
});

/**
 * Success response schema
 */
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
  });

/**
 * Enum validation helper
 */
export function createEnumSchema<T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values);
}

/**
 * Optional nullable field helper for Prisma compatibility
 */
export function optionalNullable<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullable().optional();
}

/**
 * CSV import validation
 */
export const CsvImportBaseSchema = z.object({
  file: z.string().min(1, 'File content is required'),
  delimiter: z.string().default(','),
  skipFirstRow: z.boolean().default(true),
});

/**
 * Audit log validation
 */
export const AuditLogSchema = z.object({
  action: z.string().min(1).max(50),
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
  changes: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Role validation
 */
export const RoleSchema = z.enum(['ADMIN', 'INTERNAL', 'INVESTOR']);

/**
 * Asset type validation
 */
export const AssetTypeSchema = z.enum([
  'real_estate',
  'stocks',
  'bonds',
  'commodities',
  'crypto',
  'other',
]);

/**
 * Transaction type validation
 */
export const TransactionTypeSchema = z.enum(['DEPOSIT', 'WITHDRAWAL']);

/**
 * Asset event type validation
 */
export const AssetEventTypeSchema = z.enum([
  'VALUATION',
  'PAYMENT_IN',
  'PAYMENT_OUT',
  'CAPEX',
  'NOTE',
  'SALE',
]);

/**
 * Document category validation
 */
export const DocumentCategorySchema = z.enum([
  'contract',
  'invoice',
  'report',
  'statement',
  'other',
]);

// Type exports for use in other files
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type AssetType = z.infer<typeof AssetTypeSchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type AssetEventType = z.infer<typeof AssetEventTypeSchema>;
export type DocumentCategory = z.infer<typeof DocumentCategorySchema>;

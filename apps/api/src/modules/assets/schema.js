import { z } from 'zod';
// Asset type enum
export const AssetType = {
  POZICKY: 'PÔŽIČKY',
  NEHNUTELNOSTI: 'NEHNUTEĽNOSTI',
  AUTA: 'AUTÁ',
  AKCIE: 'AKCIE',
  MATERIAL: 'MATERIÁL',
  PODIEL_VO_FIRME: 'PODIEL VO FIRME',
};
// Asset event type enum
export const AssetEventType = {
  VALUATION: 'VALUATION',
  PAYMENT_IN: 'PAYMENT_IN',
  PAYMENT_OUT: 'PAYMENT_OUT',
  CAPEX: 'CAPEX',
  NOTE: 'NOTE',
  SALE: 'SALE',
};
// Asset schemas
export const createAssetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum([
    AssetType.POZICKY,
    AssetType.NEHNUTELNOSTI,
    AssetType.AUTA,
    AssetType.AKCIE,
    AssetType.MATERIAL,
    AssetType.PODIEL_VO_FIRME,
  ]),
  category: z.string().optional(),
  description: z.string().optional(),
  currentValue: z.number().min(0, 'Current value must be non-negative'),
  acquiredPrice: z.number().min(0, 'Acquired price must be non-negative').optional(),
});
export const updateAssetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  type: z
    .enum([
      AssetType.POZICKY,
      AssetType.NEHNUTELNOSTI,
      AssetType.AUTA,
      AssetType.AKCIE,
      AssetType.MATERIAL,
      AssetType.PODIEL_VO_FIRME,
    ])
    .optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  currentValue: z.number().min(0, 'Current value must be non-negative').optional(),
  acquiredPrice: z.number().min(0, 'Acquired price must be non-negative').optional(),
  status: z.enum(['ACTIVE', 'SOLD']).optional(),
  salePrice: z.number().optional(),
  saleDate: z.coerce.date().optional(),
});
// Asset event schemas
export const createAssetEventSchema = z.object({
  assetId: z.string().cuid('Invalid asset ID format'),
  type: z.enum([
    AssetEventType.VALUATION,
    AssetEventType.PAYMENT_IN,
    AssetEventType.PAYMENT_OUT,
    AssetEventType.CAPEX,
    AssetEventType.NOTE,
    AssetEventType.SALE,
  ]),
  amount: z.number(),
  date: z.coerce.date(),
  note: z.string().optional(),
});
export const updateAssetEventSchema = z.object({
  type: z
    .enum([
      AssetEventType.VALUATION,
      AssetEventType.PAYMENT_IN,
      AssetEventType.PAYMENT_OUT,
      AssetEventType.CAPEX,
      AssetEventType.NOTE,
      AssetEventType.SALE,
    ])
    .optional(),
  amount: z.number().optional(),
  date: z.coerce.date().optional(),
  note: z.string().optional(),
});
// Query schemas
export const getAssetsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100), // Increased default and max limit
  search: z.string().optional(),
  q: z.string().optional(), // Alternative search parameter
  type: z
    .enum([
      AssetType.POZICKY,
      AssetType.NEHNUTELNOSTI,
      AssetType.AUTA,
      AssetType.AKCIE,
      AssetType.MATERIAL,
      AssetType.PODIEL_VO_FIRME,
    ])
    .optional(),
  sortBy: z.enum(['name', 'type', 'currentValue', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export const getAssetEventsQuerySchema = z.object({
  assetId: z.string().cuid().optional(),
  type: z
    .enum([
      AssetEventType.VALUATION,
      AssetEventType.PAYMENT_IN,
      AssetEventType.PAYMENT_OUT,
      AssetEventType.CAPEX,
      AssetEventType.NOTE,
      AssetEventType.SALE,
    ])
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
// Response schemas
export const assetResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  currentValue: z.number(),
  status: z.string().optional(),
  acquiredPrice: z.number().nullable().optional(),
  salePrice: z.number().nullable().optional(),
  saleDate: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  eventsCount: z.number().optional(),
  totalInflows: z.number().optional(),
  totalOutflows: z.number().optional(),
});
export const assetEventResponseSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  type: z.string(),
  amount: z.number(),
  date: z.date(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  asset: z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })
    .optional(),
});
//# sourceMappingURL=schema.js.map

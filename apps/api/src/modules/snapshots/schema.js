import { z } from 'zod';
// Snapshot schemas
export const createSnapshotSchema = z.object({
  date: z.coerce.date(),
  performanceFeeRate: z.number().min(0).max(100).optional(),
  note: z.string().optional(),
});
export const updateSnapshotSchema = z.object({
  date: z.coerce.date().optional(),
  performanceFeeRate: z.number().min(0).max(100).optional(),
  note: z.string().optional(),
});
// Query schemas
export const getSnapshotsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(['date', 'nav', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
// Response schemas
export const snapshotResponseSchema = z.object({
  id: z.string(),
  date: z.date(),
  totalAssetValue: z.number(),
  totalBankBalance: z.number(),
  totalLiabilities: z.number(),
  nav: z.number(),
  performanceFeeRate: z.number().nullable(),
  totalPerformanceFee: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  investorSnapshots: z
    .array(
      z.object({
        id: z.string(),
        investorId: z.string(),
        capitalAmount: z.number(),
        ownershipPercent: z.number(),
        performanceFee: z.number().nullable(),
        investor: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        }),
      })
    )
    .optional(),
});
export const investorSnapshotResponseSchema = z.object({
  id: z.string(),
  snapshotId: z.string(),
  investorId: z.string(),
  capitalAmount: z.number(),
  ownershipPercent: z.number(),
  performanceFee: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  investor: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  snapshot: z
    .object({
      id: z.string(),
      date: z.date(),
      nav: z.number(),
    })
    .optional(),
});
// NAV calculation result schema
export const navCalculationSchema = z.object({
  totalAssetValue: z.number(),
  totalBankBalance: z.number(),
  totalLiabilities: z.number(),
  nav: z.number(),
  assetBreakdown: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
      totalValue: z.number(),
    })
  ),
  bankBreakdown: z.array(
    z.object({
      currency: z.string(),
      totalAmount: z.number(),
    })
  ),
  liabilityBreakdown: z.array(
    z.object({
      name: z.string(),
      currentBalance: z.number(),
    })
  ),
});
// Investor ownership calculation schema
export const investorOwnershipSchema = z.object({
  investorId: z.string(),
  name: z.string(),
  email: z.string(),
  totalDeposits: z.number(),
  totalWithdrawals: z.number(),
  capitalAmount: z.number(),
  ownershipPercent: z.number(),
  performanceFee: z.number().nullable(),
});
//# sourceMappingURL=schema.js.map

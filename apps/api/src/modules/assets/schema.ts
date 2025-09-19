import { z } from 'zod';

// Asset type enum
export const AssetType = {
  POZICKY: 'PÔŽIČKY',
  NEHNUTELNOSTI: 'NEHNUTEĽNOSTI',
  AUTA: 'AUTÁ',
  AKCIE: 'AKCIE',
  MATERIAL: 'MATERIÁL',
  PODIEL_VO_FIRME: 'PODIEL VO FIRME',
} as const;

export type AssetTypeEnum = (typeof AssetType)[keyof typeof AssetType];

// Asset event type enum
export const AssetEventType = {
  VALUATION: 'VALUATION',
  PAYMENT_IN: 'PAYMENT_IN',
  PAYMENT_OUT: 'PAYMENT_OUT',
  CAPEX: 'CAPEX',
  NOTE: 'NOTE',
  SALE: 'SALE',
  // Loan-specific events
  LOAN_DISBURSEMENT: 'LOAN_DISBURSEMENT', // Poskytnutie pôžičky
  INTEREST_ACCRUAL: 'INTEREST_ACCRUAL', // Narastanie úroku
  INTEREST_PAYMENT: 'INTEREST_PAYMENT', // Platba úroku
  PRINCIPAL_PAYMENT: 'PRINCIPAL_PAYMENT', // Platba istiny
  LOAN_REPAYMENT: 'LOAN_REPAYMENT', // Splatenie pôžičky
  DEFAULT: 'DEFAULT', // Defaultovanie pôžičky
} as const;

export type AssetEventTypeEnum = (typeof AssetEventType)[keyof typeof AssetEventType];

// Asset schemas
// Interest period enum
export const InterestPeriod = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
  AT_MATURITY: 'AT_MATURITY',
} as const;

export type InterestPeriodEnum = (typeof InterestPeriod)[keyof typeof InterestPeriod];

// Loan status enum
export const LoanStatus = {
  ACTIVE: 'ACTIVE',
  REPAID: 'REPAID',
  DEFAULTED: 'DEFAULTED',
} as const;

export type LoanStatusEnum = (typeof LoanStatus)[keyof typeof LoanStatus];

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
  acquiredDate: z.coerce.date().optional(),
  // Loan-specific fields
  loanPrincipal: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(100).optional(), // Percentage
  interestPeriod: z.enum([InterestPeriod.MONTHLY, InterestPeriod.QUARTERLY, InterestPeriod.YEARLY, InterestPeriod.AT_MATURITY]).optional(),
  loanStartDate: z.coerce.date().optional(),
  loanMaturityDate: z.coerce.date().optional(),
  loanStatus: z.enum([LoanStatus.ACTIVE, LoanStatus.REPAID, LoanStatus.DEFAULTED]).optional(),
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
  acquiredDate: z.coerce.date().optional(),
  status: z.enum(['ACTIVE', 'SOLD']).optional(),
  salePrice: z.number().optional(),
  saleDate: z.coerce.date().optional(),
  // Loan-specific fields
  loanPrincipal: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  interestPeriod: z.enum([InterestPeriod.MONTHLY, InterestPeriod.QUARTERLY, InterestPeriod.YEARLY, InterestPeriod.AT_MATURITY]).optional(),
  loanStartDate: z.coerce.date().optional(),
  loanMaturityDate: z.coerce.date().optional(),
  loanStatus: z.enum([LoanStatus.ACTIVE, LoanStatus.REPAID, LoanStatus.DEFAULTED]).optional(),
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
    AssetEventType.LOAN_DISBURSEMENT,
    AssetEventType.INTEREST_ACCRUAL,
    AssetEventType.INTEREST_PAYMENT,
    AssetEventType.PRINCIPAL_PAYMENT,
    AssetEventType.LOAN_REPAYMENT,
    AssetEventType.DEFAULT,
  ]),
  amount: z.number().optional(),
  date: z.coerce.date(),
  note: z.string().optional(),
  // Loan payment tracking fields
  isPaid: z.boolean().optional(),
  paymentDate: z.coerce.date().optional(),
  principalAmount: z.number().optional(),
  interestAmount: z.number().optional(),
  referencePeriodStart: z.coerce.date().optional(),
  referencePeriodEnd: z.coerce.date().optional(),
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
      AssetEventType.LOAN_DISBURSEMENT,
      AssetEventType.INTEREST_ACCRUAL,
      AssetEventType.INTEREST_PAYMENT,
      AssetEventType.PRINCIPAL_PAYMENT,
      AssetEventType.LOAN_REPAYMENT,
      AssetEventType.DEFAULT,
    ])
    .optional(),
  amount: z.number().optional(),
  date: z.coerce.date().optional(),
  note: z.string().optional(),
  // Loan payment tracking fields
  isPaid: z.boolean().optional(),
  paymentDate: z.coerce.date().optional(),
  principalAmount: z.number().optional(),
  interestAmount: z.number().optional(),
  referencePeriodStart: z.coerce.date().optional(),
  referencePeriodEnd: z.coerce.date().optional(),
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
      AssetEventType.LOAN_DISBURSEMENT,
      AssetEventType.INTEREST_ACCRUAL,
      AssetEventType.INTEREST_PAYMENT,
      AssetEventType.PRINCIPAL_PAYMENT,
      AssetEventType.LOAN_REPAYMENT,
      AssetEventType.DEFAULT,
    ])
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isPaid: z.boolean().optional(), // Filter by payment status
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
  acquiredDate: z.date().nullable().optional(),
  salePrice: z.number().nullable().optional(),
  saleDate: z.date().nullable().optional(),
  // Loan-specific fields
  loanPrincipal: z.number().nullable().optional(),
  interestRate: z.number().nullable().optional(),
  interestPeriod: z.string().nullable().optional(),
  loanStartDate: z.date().nullable().optional(),
  loanMaturityDate: z.date().nullable().optional(),
  loanStatus: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  eventsCount: z.number().optional(),
  totalInflows: z.number().optional(),
  totalOutflows: z.number().optional(),
  // Loan-specific calculations
  totalInterestEarned: z.number().optional(),
  totalInterestPaid: z.number().optional(),
  totalInterestUnpaid: z.number().optional(),
  outstandingPrincipal: z.number().optional(),
});

export const assetEventResponseSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  type: z.string(),
  amount: z.number().nullable(),
  date: z.date(),
  note: z.string().nullable(),
  // Loan payment tracking fields
  isPaid: z.boolean().nullable().optional(),
  paymentDate: z.date().nullable().optional(),
  principalAmount: z.number().nullable().optional(),
  interestAmount: z.number().nullable().optional(),
  referencePeriodStart: z.date().nullable().optional(),
  referencePeriodEnd: z.date().nullable().optional(),
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

// Types
export type CreateAssetRequest = z.infer<typeof createAssetSchema>;
export type UpdateAssetRequest = z.infer<typeof updateAssetSchema>;
export type CreateAssetEventRequest = z.infer<typeof createAssetEventSchema>;
export type UpdateAssetEventRequest = z.infer<typeof updateAssetEventSchema>;
export type GetAssetsQuery = z.infer<typeof getAssetsQuerySchema>;
export type GetAssetEventsQuery = z.infer<typeof getAssetEventsQuerySchema>;
export type AssetResponse = z.infer<typeof assetResponseSchema>;
export type AssetEventResponse = z.infer<typeof assetEventResponseSchema>;

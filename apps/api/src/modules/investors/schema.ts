import { z } from 'zod';

// Investor schemas
export const createInvestorSchema = z.object({
  userId: z.string().cuid('Invalid user ID format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export const updateInvestorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

// Investor cashflow schemas
export const createCashflowSchema = z.object({
  investorId: z.string().cuid('Invalid investor ID format'),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL'], {
    errorMap: () => ({ message: 'Type must be DEPOSIT or WITHDRAWAL' }),
  }),
  amount: z.number().positive('Amount must be positive'),
  date: z.coerce.date(),
  note: z.string().optional(),
});

export const updateCashflowSchema = z.object({
  type: z.enum(['DEPOSIT', 'WITHDRAWAL']).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  date: z.coerce.date().optional(),
  note: z.string().optional(),
});

// Query schemas
export const getInvestorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const getCashflowsQuerySchema = z.object({
  investorId: z.string().cuid().optional(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Response schemas
export const investorResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  taxId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  totalCapital: z.number().optional(),
  totalDeposits: z.number().optional(),
  totalWithdrawals: z.number().optional(),
});

export const cashflowResponseSchema = z.object({
  id: z.string(),
  investorId: z.string(),
  type: z.string(),
  amount: z.number(),
  date: z.date(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  investor: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }).optional(),
});

// Types
export type CreateInvestorRequest = z.infer<typeof createInvestorSchema>;
export type UpdateInvestorRequest = z.infer<typeof updateInvestorSchema>;
export type CreateCashflowRequest = z.infer<typeof createCashflowSchema>;
export type UpdateCashflowRequest = z.infer<typeof updateCashflowSchema>;
export type GetInvestorsQuery = z.infer<typeof getInvestorsQuerySchema>;
export type GetCashflowsQuery = z.infer<typeof getCashflowsQuerySchema>;
export type InvestorResponse = z.infer<typeof investorResponseSchema>;
export type CashflowResponse = z.infer<typeof cashflowResponseSchema>;

// Cashflow type enum
export const CashflowType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
} as const;

export type CashflowTypeEnum = typeof CashflowType[keyof typeof CashflowType];

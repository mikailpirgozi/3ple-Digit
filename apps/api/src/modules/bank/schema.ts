import { z } from 'zod';

// Bank balance schemas
export const createBankBalanceSchema = z.object({
  accountName: z.string().min(2, 'Account name must be at least 2 characters'),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  amount: z.number(),
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., EUR, USD)').default('EUR'),
  date: z.coerce.date(),
});

export const updateBankBalanceSchema = z.object({
  accountName: z.string().min(2, 'Account name must be at least 2 characters').optional(),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
  date: z.coerce.date().optional(),
});

// CSV import schemas
export const csvImportSchema = z.object({
  file: z.string(), // Base64 encoded CSV content
  delimiter: z.string().default(','),
  skipFirstRow: z.boolean().default(true),
  mapping: z.object({
    accountName: z.number().min(0, 'Column index must be non-negative'),
    bankName: z.number().min(0).optional(),
    accountType: z.number().min(0).optional(),
    amount: z.number().min(0, 'Amount column is required'),
    currency: z.number().min(0).optional(),
    date: z.number().min(0, 'Date column is required'),
  }),
});

// CSV row validation schema
export const csvRowSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  amount: z.number(),
  currency: z.string().length(3).default('EUR'),
  date: z.date(),
});

// Query schemas
export const getBankBalancesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  currency: z.string().length(3).optional(),
  accountName: z.string().optional(),
  bankName: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(['accountName', 'bankName', 'amount', 'date', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Response schemas
export const bankBalanceResponseSchema = z.object({
  id: z.string(),
  accountName: z.string(),
  bankName: z.string().nullable(),
  accountType: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const csvImportResultSchema = z.object({
  totalRows: z.number(),
  successfulRows: z.number(),
  failedRows: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    errors: z.array(z.string()),
    data: z.record(z.unknown()).optional(),
  })),
  importedBalances: z.array(bankBalanceResponseSchema),
});

// Types
export type CreateBankBalanceRequest = z.infer<typeof createBankBalanceSchema>;
export type UpdateBankBalanceRequest = z.infer<typeof updateBankBalanceSchema>;
export type CsvImportRequest = z.infer<typeof csvImportSchema> & {
  delimiter: string; // Override to make delimiter required
};
export type CsvRowData = z.infer<typeof csvRowSchema>;
export type GetBankBalancesQuery = z.infer<typeof getBankBalancesQuerySchema>;
export type BankBalanceResponse = z.infer<typeof bankBalanceResponseSchema>;
export type CsvImportResult = z.infer<typeof csvImportResultSchema>;

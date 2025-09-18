import { z } from 'zod';
export declare const createBankBalanceSchema: z.ZodObject<
  {
    accountName: z.ZodString;
    bankName: z.ZodOptional<z.ZodString>;
    accountType: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    date: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    date: Date;
    amount: number;
    accountName: string;
    currency: string;
    bankName?: string | undefined;
    accountType?: string | undefined;
  },
  {
    date: Date;
    amount: number;
    accountName: string;
    bankName?: string | undefined;
    accountType?: string | undefined;
    currency?: string | undefined;
  }
>;
export declare const updateBankBalanceSchema: z.ZodObject<
  {
    accountName: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
    accountType: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    date?: Date | undefined;
    amount?: number | undefined;
    accountName?: string | undefined;
    bankName?: string | undefined;
    accountType?: string | undefined;
    currency?: string | undefined;
  },
  {
    date?: Date | undefined;
    amount?: number | undefined;
    accountName?: string | undefined;
    bankName?: string | undefined;
    accountType?: string | undefined;
    currency?: string | undefined;
  }
>;
export declare const csvImportSchema: z.ZodObject<
  {
    file: z.ZodString;
    delimiter: z.ZodDefault<z.ZodString>;
    skipFirstRow: z.ZodDefault<z.ZodBoolean>;
    mapping: z.ZodObject<
      {
        accountName: z.ZodNumber;
        bankName: z.ZodOptional<z.ZodNumber>;
        accountType: z.ZodOptional<z.ZodNumber>;
        amount: z.ZodNumber;
        currency: z.ZodOptional<z.ZodNumber>;
        date: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        date: number;
        amount: number;
        accountName: number;
        bankName?: number | undefined;
        accountType?: number | undefined;
        currency?: number | undefined;
      },
      {
        date: number;
        amount: number;
        accountName: number;
        bankName?: number | undefined;
        accountType?: number | undefined;
        currency?: number | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    file: string;
    delimiter: string;
    skipFirstRow: boolean;
    mapping: {
      date: number;
      amount: number;
      accountName: number;
      bankName?: number | undefined;
      accountType?: number | undefined;
      currency?: number | undefined;
    };
  },
  {
    file: string;
    mapping: {
      date: number;
      amount: number;
      accountName: number;
      bankName?: number | undefined;
      accountType?: number | undefined;
      currency?: number | undefined;
    };
    delimiter?: string | undefined;
    skipFirstRow?: boolean | undefined;
  }
>;
export declare const csvRowSchema: z.ZodObject<
  {
    accountName: z.ZodString;
    bankName: z.ZodOptional<z.ZodString>;
    accountType: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    date: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    date: Date;
    amount: number;
    accountName: string;
    currency: string;
    bankName?: string | undefined;
    accountType?: string | undefined;
  },
  {
    date: Date;
    amount: number;
    accountName: string;
    bankName?: string | undefined;
    accountType?: string | undefined;
    currency?: string | undefined;
  }
>;
export declare const getBankBalancesQuerySchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    accountName: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    sortBy: z.ZodDefault<z.ZodEnum<['accountName', 'bankName', 'amount', 'date', 'createdAt']>>;
    sortOrder: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    sortBy: 'date' | 'amount' | 'createdAt' | 'accountName' | 'bankName';
    sortOrder: 'asc' | 'desc';
    search?: string | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    accountName?: string | undefined;
    bankName?: string | undefined;
    currency?: string | undefined;
  },
  {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sortBy?: 'date' | 'amount' | 'createdAt' | 'accountName' | 'bankName' | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    accountName?: string | undefined;
    bankName?: string | undefined;
    currency?: string | undefined;
  }
>;
export declare const bankBalanceResponseSchema: z.ZodObject<
  {
    id: z.ZodString;
    accountName: z.ZodString;
    bankName: z.ZodNullable<z.ZodString>;
    accountType: z.ZodNullable<z.ZodString>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    date: z.ZodDate;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    date: Date;
    amount: number;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    accountName: string;
    bankName: string | null;
    accountType: string | null;
    currency: string;
  },
  {
    date: Date;
    amount: number;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    accountName: string;
    bankName: string | null;
    accountType: string | null;
    currency: string;
  }
>;
export declare const csvImportResultSchema: z.ZodObject<
  {
    totalRows: z.ZodNumber;
    successfulRows: z.ZodNumber;
    failedRows: z.ZodNumber;
    errors: z.ZodArray<
      z.ZodObject<
        {
          row: z.ZodNumber;
          errors: z.ZodArray<z.ZodString, 'many'>;
          data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          errors: string[];
          row: number;
          data?: Record<string, unknown> | undefined;
        },
        {
          errors: string[];
          row: number;
          data?: Record<string, unknown> | undefined;
        }
      >,
      'many'
    >;
    importedBalances: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          accountName: z.ZodString;
          bankName: z.ZodNullable<z.ZodString>;
          accountType: z.ZodNullable<z.ZodString>;
          amount: z.ZodNumber;
          currency: z.ZodString;
          date: z.ZodDate;
          createdAt: z.ZodDate;
          updatedAt: z.ZodDate;
        },
        'strip',
        z.ZodTypeAny,
        {
          date: Date;
          amount: number;
          createdAt: Date;
          id: string;
          updatedAt: Date;
          accountName: string;
          bankName: string | null;
          accountType: string | null;
          currency: string;
        },
        {
          date: Date;
          amount: number;
          createdAt: Date;
          id: string;
          updatedAt: Date;
          accountName: string;
          bankName: string | null;
          accountType: string | null;
          currency: string;
        }
      >,
      'many'
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    errors: {
      errors: string[];
      row: number;
      data?: Record<string, unknown> | undefined;
    }[];
    importedBalances: {
      date: Date;
      amount: number;
      createdAt: Date;
      id: string;
      updatedAt: Date;
      accountName: string;
      bankName: string | null;
      accountType: string | null;
      currency: string;
    }[];
  },
  {
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    errors: {
      errors: string[];
      row: number;
      data?: Record<string, unknown> | undefined;
    }[];
    importedBalances: {
      date: Date;
      amount: number;
      createdAt: Date;
      id: string;
      updatedAt: Date;
      accountName: string;
      bankName: string | null;
      accountType: string | null;
      currency: string;
    }[];
  }
>;
export type CreateBankBalanceRequest = z.infer<typeof createBankBalanceSchema>;
export type UpdateBankBalanceRequest = z.infer<typeof updateBankBalanceSchema>;
export type CsvImportRequest = z.infer<typeof csvImportSchema> & {
  delimiter: string;
};
export type CsvRowData = z.infer<typeof csvRowSchema>;
export type GetBankBalancesQuery = z.infer<typeof getBankBalancesQuerySchema>;
export type BankBalanceResponse = z.infer<typeof bankBalanceResponseSchema>;
export type CsvImportResult = z.infer<typeof csvImportResultSchema>;
//# sourceMappingURL=schema.d.ts.map

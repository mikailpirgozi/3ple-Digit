import { z } from 'zod';
export declare const createInvestorSchema: z.ZodObject<
  {
    userId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    userId: string;
    email: string;
    phone?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
  },
  {
    name: string;
    userId: string;
    email: string;
    phone?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
  }
>;
export declare const updateInvestorSchema: z.ZodObject<
  {
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
  },
  {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    taxId?: string | undefined;
  }
>;
export declare const createCashflowSchema: z.ZodObject<
  {
    investorId: z.ZodString;
    type: z.ZodEnum<['DEPOSIT', 'WITHDRAWAL']>;
    amount: z.ZodNumber;
    date: z.ZodDate;
    note: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    type: 'DEPOSIT' | 'WITHDRAWAL';
    date: Date;
    amount: number;
    investorId: string;
    note?: string | undefined;
  },
  {
    type: 'DEPOSIT' | 'WITHDRAWAL';
    date: Date;
    amount: number;
    investorId: string;
    note?: string | undefined;
  }
>;
export declare const updateCashflowSchema: z.ZodObject<
  {
    type: z.ZodOptional<z.ZodEnum<['DEPOSIT', 'WITHDRAWAL']>>;
    amount: z.ZodOptional<z.ZodNumber>;
    date: z.ZodOptional<z.ZodDate>;
    note: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    type?: 'DEPOSIT' | 'WITHDRAWAL' | undefined;
    date?: Date | undefined;
    amount?: number | undefined;
    note?: string | undefined;
  },
  {
    type?: 'DEPOSIT' | 'WITHDRAWAL' | undefined;
    date?: Date | undefined;
    amount?: number | undefined;
    note?: string | undefined;
  }
>;
export declare const getInvestorsQuerySchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<['name', 'email', 'createdAt']>>;
    sortOrder: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    sortBy: 'name' | 'createdAt' | 'email';
    sortOrder: 'asc' | 'desc';
    search?: string | undefined;
  },
  {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sortBy?: 'name' | 'createdAt' | 'email' | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
  }
>;
export declare const getCashflowsQuerySchema: z.ZodObject<
  {
    investorId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<['DEPOSIT', 'WITHDRAWAL']>>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<['date', 'amount', 'createdAt']>>;
    sortOrder: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    sortBy: 'date' | 'amount' | 'createdAt';
    sortOrder: 'asc' | 'desc';
    type?: 'DEPOSIT' | 'WITHDRAWAL' | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    investorId?: string | undefined;
  },
  {
    type?: 'DEPOSIT' | 'WITHDRAWAL' | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: 'date' | 'amount' | 'createdAt' | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    investorId?: string | undefined;
  }
>;
export declare const investorResponseSchema: z.ZodObject<
  {
    id: z.ZodString;
    userId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    address: z.ZodNullable<z.ZodString>;
    taxId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    totalCapital: z.ZodOptional<z.ZodNumber>;
    totalDeposits: z.ZodOptional<z.ZodNumber>;
    totalWithdrawals: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    userId: string;
    email: string;
    phone: string | null;
    address: string | null;
    taxId: string | null;
    totalCapital?: number | undefined;
    totalDeposits?: number | undefined;
    totalWithdrawals?: number | undefined;
  },
  {
    name: string;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    userId: string;
    email: string;
    phone: string | null;
    address: string | null;
    taxId: string | null;
    totalCapital?: number | undefined;
    totalDeposits?: number | undefined;
    totalWithdrawals?: number | undefined;
  }
>;
export declare const cashflowResponseSchema: z.ZodObject<
  {
    id: z.ZodString;
    investorId: z.ZodString;
    type: z.ZodString;
    amount: z.ZodNumber;
    date: z.ZodDate;
    note: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    investor: z.ZodOptional<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          email: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          name: string;
          id: string;
          email: string;
        },
        {
          name: string;
          id: string;
          email: string;
        }
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    type: string;
    date: Date;
    amount: number;
    note: string | null;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    investorId: string;
    investor?:
      | {
          name: string;
          id: string;
          email: string;
        }
      | undefined;
  },
  {
    type: string;
    date: Date;
    amount: number;
    note: string | null;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    investorId: string;
    investor?:
      | {
          name: string;
          id: string;
          email: string;
        }
      | undefined;
  }
>;
export type CreateInvestorRequest = z.infer<typeof createInvestorSchema>;
export type UpdateInvestorRequest = z.infer<typeof updateInvestorSchema>;
export type CreateCashflowRequest = z.infer<typeof createCashflowSchema>;
export type UpdateCashflowRequest = z.infer<typeof updateCashflowSchema>;
export type GetInvestorsQuery = z.infer<typeof getInvestorsQuerySchema>;
export type GetCashflowsQuery = z.infer<typeof getCashflowsQuerySchema>;
export type InvestorResponse = z.infer<typeof investorResponseSchema>;
export type CashflowResponse = z.infer<typeof cashflowResponseSchema>;
export declare const CashflowType: {
  readonly DEPOSIT: 'DEPOSIT';
  readonly WITHDRAWAL: 'WITHDRAWAL';
};
export type CashflowTypeEnum = (typeof CashflowType)[keyof typeof CashflowType];
//# sourceMappingURL=schema.d.ts.map

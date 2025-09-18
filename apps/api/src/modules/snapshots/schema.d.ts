import { z } from 'zod';
export declare const createSnapshotSchema: z.ZodObject<
  {
    date: z.ZodDate;
    performanceFeeRate: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    date: Date;
    note?: string | undefined;
    performanceFeeRate?: number | undefined;
  },
  {
    date: Date;
    note?: string | undefined;
    performanceFeeRate?: number | undefined;
  }
>;
export declare const updateSnapshotSchema: z.ZodObject<
  {
    date: z.ZodOptional<z.ZodDate>;
    performanceFeeRate: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    date?: Date | undefined;
    note?: string | undefined;
    performanceFeeRate?: number | undefined;
  },
  {
    date?: Date | undefined;
    note?: string | undefined;
    performanceFeeRate?: number | undefined;
  }
>;
export declare const getSnapshotsQuerySchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    sortBy: z.ZodDefault<z.ZodEnum<['date', 'nav', 'createdAt']>>;
    sortOrder: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    sortBy: 'date' | 'createdAt' | 'nav';
    sortOrder: 'asc' | 'desc';
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
  },
  {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: 'date' | 'createdAt' | 'nav' | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
  }
>;
export declare const snapshotResponseSchema: z.ZodObject<
  {
    id: z.ZodString;
    date: z.ZodDate;
    totalAssetValue: z.ZodNumber;
    totalBankBalance: z.ZodNumber;
    totalLiabilities: z.ZodNumber;
    nav: z.ZodNumber;
    performanceFeeRate: z.ZodNullable<z.ZodNumber>;
    totalPerformanceFee: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    investorSnapshots: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            investorId: z.ZodString;
            capitalAmount: z.ZodNumber;
            ownershipPercent: z.ZodNumber;
            performanceFee: z.ZodNullable<z.ZodNumber>;
            investor: z.ZodObject<
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
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            investorId: string;
            investor: {
              name: string;
              id: string;
              email: string;
            };
            capitalAmount: number;
            ownershipPercent: number;
            performanceFee: number | null;
          },
          {
            id: string;
            investorId: string;
            investor: {
              name: string;
              id: string;
              email: string;
            };
            capitalAmount: number;
            ownershipPercent: number;
            performanceFee: number | null;
          }
        >,
        'many'
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    date: Date;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    performanceFeeRate: number | null;
    nav: number;
    totalAssetValue: number;
    totalBankBalance: number;
    totalLiabilities: number;
    totalPerformanceFee: number | null;
    investorSnapshots?:
      | {
          id: string;
          investorId: string;
          investor: {
            name: string;
            id: string;
            email: string;
          };
          capitalAmount: number;
          ownershipPercent: number;
          performanceFee: number | null;
        }[]
      | undefined;
  },
  {
    date: Date;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    performanceFeeRate: number | null;
    nav: number;
    totalAssetValue: number;
    totalBankBalance: number;
    totalLiabilities: number;
    totalPerformanceFee: number | null;
    investorSnapshots?:
      | {
          id: string;
          investorId: string;
          investor: {
            name: string;
            id: string;
            email: string;
          };
          capitalAmount: number;
          ownershipPercent: number;
          performanceFee: number | null;
        }[]
      | undefined;
  }
>;
export declare const investorSnapshotResponseSchema: z.ZodObject<
  {
    id: z.ZodString;
    snapshotId: z.ZodString;
    investorId: z.ZodString;
    capitalAmount: z.ZodNumber;
    ownershipPercent: z.ZodNumber;
    performanceFee: z.ZodNullable<z.ZodNumber>;
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
    snapshot: z.ZodOptional<
      z.ZodObject<
        {
          id: z.ZodString;
          date: z.ZodDate;
          nav: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          date: Date;
          id: string;
          nav: number;
        },
        {
          date: Date;
          id: string;
          nav: number;
        }
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    createdAt: Date;
    id: string;
    updatedAt: Date;
    investorId: string;
    capitalAmount: number;
    ownershipPercent: number;
    performanceFee: number | null;
    snapshotId: string;
    investor?:
      | {
          name: string;
          id: string;
          email: string;
        }
      | undefined;
    snapshot?:
      | {
          date: Date;
          id: string;
          nav: number;
        }
      | undefined;
  },
  {
    createdAt: Date;
    id: string;
    updatedAt: Date;
    investorId: string;
    capitalAmount: number;
    ownershipPercent: number;
    performanceFee: number | null;
    snapshotId: string;
    investor?:
      | {
          name: string;
          id: string;
          email: string;
        }
      | undefined;
    snapshot?:
      | {
          date: Date;
          id: string;
          nav: number;
        }
      | undefined;
  }
>;
export declare const navCalculationSchema: z.ZodObject<
  {
    totalAssetValue: z.ZodNumber;
    totalBankBalance: z.ZodNumber;
    totalLiabilities: z.ZodNumber;
    nav: z.ZodNumber;
    assetBreakdown: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString;
          count: z.ZodNumber;
          totalValue: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          type: string;
          count: number;
          totalValue: number;
        },
        {
          type: string;
          count: number;
          totalValue: number;
        }
      >,
      'many'
    >;
    bankBreakdown: z.ZodArray<
      z.ZodObject<
        {
          currency: z.ZodString;
          totalAmount: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          currency: string;
          totalAmount: number;
        },
        {
          currency: string;
          totalAmount: number;
        }
      >,
      'many'
    >;
    liabilityBreakdown: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          currentBalance: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          name: string;
          currentBalance: number;
        },
        {
          name: string;
          currentBalance: number;
        }
      >,
      'many'
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    nav: number;
    totalAssetValue: number;
    totalBankBalance: number;
    totalLiabilities: number;
    assetBreakdown: {
      type: string;
      count: number;
      totalValue: number;
    }[];
    bankBreakdown: {
      currency: string;
      totalAmount: number;
    }[];
    liabilityBreakdown: {
      name: string;
      currentBalance: number;
    }[];
  },
  {
    nav: number;
    totalAssetValue: number;
    totalBankBalance: number;
    totalLiabilities: number;
    assetBreakdown: {
      type: string;
      count: number;
      totalValue: number;
    }[];
    bankBreakdown: {
      currency: string;
      totalAmount: number;
    }[];
    liabilityBreakdown: {
      name: string;
      currentBalance: number;
    }[];
  }
>;
export declare const investorOwnershipSchema: z.ZodObject<
  {
    investorId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    totalDeposits: z.ZodNumber;
    totalWithdrawals: z.ZodNumber;
    capitalAmount: z.ZodNumber;
    ownershipPercent: z.ZodNumber;
    performanceFee: z.ZodNullable<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    email: string;
    investorId: string;
    totalDeposits: number;
    totalWithdrawals: number;
    capitalAmount: number;
    ownershipPercent: number;
    performanceFee: number | null;
  },
  {
    name: string;
    email: string;
    investorId: string;
    totalDeposits: number;
    totalWithdrawals: number;
    capitalAmount: number;
    ownershipPercent: number;
    performanceFee: number | null;
  }
>;
export type CreateSnapshotRequest = z.infer<typeof createSnapshotSchema>;
export type UpdateSnapshotRequest = z.infer<typeof updateSnapshotSchema>;
export type GetSnapshotsQuery = z.infer<typeof getSnapshotsQuerySchema>;
export type SnapshotResponse = z.infer<typeof snapshotResponseSchema>;
export type InvestorSnapshotResponse = z.infer<typeof investorSnapshotResponseSchema>;
export type NavCalculation = z.infer<typeof navCalculationSchema>;
export type InvestorOwnership = z.infer<typeof investorOwnershipSchema>;
//# sourceMappingURL=schema.d.ts.map

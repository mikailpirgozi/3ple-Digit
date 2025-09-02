import { z } from 'zod';

// Report query schemas
export const getPortfolioReportQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  groupBy: z.enum(['type', 'month', 'quarter']).default('type'),
});

export const getInvestorReportQuerySchema = z.object({
  investorId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const getPerformanceReportQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  includeProjections: z.boolean().default(false),
});

export const getCashflowReportQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  groupBy: z.enum(['month', 'quarter', 'year']).default('month'),
});

// Export schemas
export const exportCsvSchema = z.object({
  reportType: z.enum(['portfolio', 'investors', 'performance', 'cashflow']),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  filters: z.record(z.unknown()).optional(),
});

// Response schemas
export const portfolioReportSchema = z.object({
  totalValue: z.number(),
  totalCount: z.number(),
  byType: z.array(z.object({
    type: z.string(),
    count: z.number(),
    totalValue: z.number(),
    percentage: z.number(),
  })),
  byMonth: z.array(z.object({
    month: z.string(),
    totalValue: z.number(),
    count: z.number(),
  })).optional(),
  topAssets: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    currentValue: z.number(),
  })),
});

export const investorReportSchema = z.object({
  totalInvestors: z.number(),
  totalCapital: z.number(),
  averageCapital: z.number(),
  investors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    totalDeposits: z.number(),
    totalWithdrawals: z.number(),
    capitalAmount: z.number(),
    ownershipPercent: z.number(),
    lastActivity: z.date().nullable(),
  })),
  capitalDistribution: z.array(z.object({
    range: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
});

export const performanceReportSchema = z.object({
  currentNav: z.number(),
  previousNav: z.number().nullable(),
  navChange: z.number().nullable(),
  navChangePercent: z.number().nullable(),
  totalAssets: z.number(),
  totalLiabilities: z.number(),
  totalBankBalance: z.number(),
  snapshots: z.array(z.object({
    date: z.date(),
    nav: z.number(),
    totalAssetValue: z.number(),
    totalBankBalance: z.number(),
    totalLiabilities: z.number(),
  })),
  performanceFees: z.object({
    totalCollected: z.number(),
    averageRate: z.number(),
    byPeriod: z.array(z.object({
      period: z.string(),
      amount: z.number(),
      rate: z.number(),
    })),
  }),
});

export const cashflowReportSchema = z.object({
  totalInflows: z.number(),
  totalOutflows: z.number(),
  netCashflow: z.number(),
  byPeriod: z.array(z.object({
    period: z.string(),
    inflows: z.number(),
    outflows: z.number(),
    netFlow: z.number(),
  })),
  byType: z.object({
    deposits: z.number(),
    withdrawals: z.number(),
    assetPayments: z.number(),
    expenses: z.number(),
  }),
  topInflows: z.array(z.object({
    source: z.string(),
    amount: z.number(),
    date: z.date(),
  })),
  topOutflows: z.array(z.object({
    destination: z.string(),
    amount: z.number(),
    date: z.date(),
  })),
});

// Types
export type GetPortfolioReportQuery = z.infer<typeof getPortfolioReportQuerySchema>;
export type GetInvestorReportQuery = z.infer<typeof getInvestorReportQuerySchema>;
export type GetPerformanceReportQuery = z.infer<typeof getPerformanceReportQuerySchema>;
export type GetCashflowReportQuery = z.infer<typeof getCashflowReportQuerySchema>;
export type ExportCsvRequest = z.infer<typeof exportCsvSchema>;
export type PortfolioReport = z.infer<typeof portfolioReportSchema>;
export type InvestorReport = z.infer<typeof investorReportSchema>;
export type PerformanceReport = z.infer<typeof performanceReportSchema>;
export type CashflowReport = z.infer<typeof cashflowReportSchema>;

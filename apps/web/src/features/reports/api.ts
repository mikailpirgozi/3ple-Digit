import { api } from '@/lib/api-client';
import type {
  PortfolioReport,
  InvestorReport,
  PerformanceReport,
  CashflowReport,
} from '@/types/api';

export const reportsApi = {
  // Get portfolio report
  getPortfolioReport: (filters?: Record<string, unknown>): Promise<PortfolioReport> =>
    api.get('/reports/portfolio', filters),

  // Get investor report
  getInvestorReport: (filters?: Record<string, unknown>): Promise<InvestorReport> =>
    api.get('/reports/investors', filters),

  // Get performance report
  getPerformanceReport: (filters?: Record<string, unknown>): Promise<PerformanceReport> =>
    api.get('/reports/performance', filters),

  // Get cashflow report
  getCashflowReport: (filters?: Record<string, unknown>): Promise<CashflowReport> =>
    api.get('/reports/cashflow', filters),

  // Export portfolio report as CSV
  exportPortfolioCsv: (filters?: Record<string, unknown>): Promise<Blob> =>
    api.get('/reports/portfolio/export', filters),

  // Export investor report as CSV
  exportInvestorCsv: (filters?: Record<string, unknown>): Promise<Blob> =>
    api.get('/reports/investors/export', filters),

  // Export performance report as CSV
  exportPerformanceCsv: (filters?: Record<string, unknown>): Promise<Blob> =>
    api.get('/reports/performance/export', filters),

  // Export cashflow report as CSV
  exportCashflowCsv: (filters?: Record<string, unknown>): Promise<Blob> =>
    api.get('/reports/cashflow/export', filters),
};

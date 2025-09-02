import { useMutation, useQuery } from '@tanstack/react-query';
import { reportsApi } from './api';

// Query keys factory
export const reportsKeys = {
  all: ['reports'] as const,
  portfolio: (filters?: Record<string, unknown>) => [...reportsKeys.all, 'portfolio', filters] as const,
  investors: (filters?: Record<string, unknown>) => [...reportsKeys.all, 'investors', filters] as const,
  performance: (filters?: Record<string, unknown>) => [...reportsKeys.all, 'performance', filters] as const,
  cashflow: (filters?: Record<string, unknown>) => [...reportsKeys.all, 'cashflow', filters] as const,
};

// Reports queries
export function usePortfolioReport(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: reportsKeys.portfolio(filters),
    queryFn: () => reportsApi.getPortfolioReport(filters),
  });
}

export function useInvestorReport(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: reportsKeys.investors(filters),
    queryFn: () => reportsApi.getInvestorReport(filters),
  });
}

export function usePerformanceReport(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: reportsKeys.performance(filters),
    queryFn: () => reportsApi.getPerformanceReport(filters),
  });
}

export function useCashflowReport(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: reportsKeys.cashflow(filters),
    queryFn: () => reportsApi.getCashflowReport(filters),
  });
}

// Export mutations
export function useExportPortfolio() {
  return useMutation({
    mutationFn: async (filters?: Record<string, unknown>) => {
      const blob = await reportsApi.exportPortfolioCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}

export function useExportInvestors() {
  return useMutation({
    mutationFn: async (filters?: Record<string, unknown>) => {
      const blob = await reportsApi.exportInvestorCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `investors-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}

export function useExportPerformance() {
  return useMutation({
    mutationFn: async (filters?: Record<string, unknown>) => {
      const blob = await reportsApi.exportPerformanceCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}

export function useExportCashflow() {
  return useMutation({
    mutationFn: async (filters?: Record<string, unknown>) => {
      const blob = await reportsApi.exportCashflowCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashflow-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}

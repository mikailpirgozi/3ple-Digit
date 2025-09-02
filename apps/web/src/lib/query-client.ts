import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-client';

// Create QueryClient with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - data is fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time - data stays in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'code' in error) {
          const apiError = error as ApiError;
          if (apiError.code.startsWith('4')) return false;
        }
        return failureCount < 2;
      },
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent cache keys
export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  
  // Investors
  investors: {
    all: () => ['investors'] as const,
    list: (filters?: Record<string, unknown>) => ['investors', 'list', filters] as const,
    detail: (id: string) => ['investors', 'detail', id] as const,
    overview: (id: string) => ['investors', 'overview', id] as const,
    cashflows: (id: string) => ['investors', 'cashflows', id] as const,
  },
  
  // Assets
  assets: {
    all: () => ['assets'] as const,
    list: (filters?: Record<string, unknown>) => ['assets', 'list', filters] as const,
    detail: (id: string) => ['assets', 'detail', id] as const,
    events: (id: string) => ['assets', 'events', id] as const,
  },
  
  // Bank
  bank: {
    all: () => ['bank'] as const,
    balances: (filters?: Record<string, unknown>) => ['bank', 'balances', filters] as const,
  },
  
  // Liabilities
  liabilities: {
    all: () => ['liabilities'] as const,
    list: (filters?: Record<string, unknown>) => ['liabilities', 'list', filters] as const,
    detail: (id: string) => ['liabilities', 'detail', id] as const,
  },
  
  // Snapshots
  snapshots: {
    all: () => ['snapshots'] as const,
    list: (filters?: Record<string, unknown>) => ['snapshots', 'list', filters] as const,
    detail: (id: string) => ['snapshots', 'detail', id] as const,
    currentNav: () => ['snapshots', 'nav', 'current'] as const,
  },
  
  // Documents
  documents: {
    all: () => ['documents'] as const,
    list: (filters?: Record<string, unknown>) => ['documents', 'list', filters] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
  },
  
  // Reports
  reports: {
    portfolio: (filters?: Record<string, unknown>) => ['reports', 'portfolio', filters] as const,
    investors: (filters?: Record<string, unknown>) => ['reports', 'investors', filters] as const,
    performance: (filters?: Record<string, unknown>) => ['reports', 'performance', filters] as const,
    cashflow: (filters?: Record<string, unknown>) => ['reports', 'cashflow', filters] as const,
  },
} as const;

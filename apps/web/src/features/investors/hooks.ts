import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investorsApi } from './api';
import { queryKeys } from '@/lib/query-client';
import type { InvestorFilters, CreateInvestorRequest, CreateCashflowRequest } from '@/types/api';

// Get all investors
export const useInvestors = (filters?: InvestorFilters) => {
  return useQuery({
    queryKey: queryKeys.investors.list(filters),
    queryFn: () => investorsApi.getInvestors(filters),
  });
};

// Get single investor
export const useInvestor = (id: string) => {
  return useQuery({
    queryKey: queryKeys.investors.detail(id),
    queryFn: () => investorsApi.getInvestor(id),
    enabled: Boolean(id),
  });
};

// Get investor overview
export const useInvestorOverview = (id: string) => {
  return useQuery({
    queryKey: queryKeys.investors.overview(id),
    queryFn: () => investorsApi.getInvestorOverview(id),
    enabled: Boolean(id),
  });
};

// Get investor cashflows
export const useInvestorCashflows = (id: string) => {
  return useQuery({
    queryKey: queryKeys.investors.cashflows(id),
    queryFn: () => investorsApi.getInvestorCashflows(id),
    enabled: Boolean(id),
  });
};

// Create investor mutation
export const useCreateInvestor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvestorRequest) => investorsApi.createInvestor(data),
    onSuccess: () => {
      // Invalidate investors list
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.all() });
    },
  });
};

// Update investor mutation
export const useUpdateInvestor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInvestorRequest> }) =>
      investorsApi.updateInvestor(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific investor and list
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.all() });
    },
  });
};

// Delete investor mutation
export const useDeleteInvestor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => investorsApi.deleteInvestor(id),
    onSuccess: () => {
      // Invalidate investors list
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.all() });
    },
  });
};

// Create cashflow mutation
export const useCreateCashflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCashflowRequest }) =>
      investorsApi.createCashflow(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate investor data
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.cashflows(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.overview(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.all() });
    },
  });
};

// Update cashflow mutation
export const useUpdateCashflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      investorId,
      cashflowId,
      data,
    }: {
      investorId: string;
      cashflowId: string;
      data: Partial<CreateCashflowRequest>;
    }) => investorsApi.updateCashflow(investorId, cashflowId, data),
    onSuccess: (_, { investorId }) => {
      // Invalidate investor data
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.cashflows(investorId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.overview(investorId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.all() });
    },
  });
};

// Delete cashflow mutation
export const useDeleteCashflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ investorId, cashflowId }: { investorId: string; cashflowId: string }) =>
      investorsApi.deleteCashflow(investorId, cashflowId),
    onSuccess: (_, { investorId }) => {
      // Invalidate investor data
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.cashflows(investorId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.overview(investorId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.investors.all() });
    },
  });
};

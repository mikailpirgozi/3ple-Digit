import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bankApi } from './api';
import {
  BankBalance,
  CreateBankBalanceRequest,
  BankFilters,
} from '@/types/api';

// Query keys factory
export const bankKeys = {
  all: ['bank'] as const,
  balances: () => [...bankKeys.all, 'balances'] as const,
  balancesList: (filters?: BankFilters) => [...bankKeys.balances(), 'list', filters] as const,
  balance: (id: string) => [...bankKeys.balances(), id] as const,
  accountNames: () => [...bankKeys.all, 'account-names'] as const,
};

// Bank queries
export function useBankBalances(filters?: BankFilters) {
  return useQuery({
    queryKey: bankKeys.balancesList(filters),
    queryFn: () => bankApi.getBankBalances(filters),
  });
}

export function useBankBalance(id: string) {
  return useQuery({
    queryKey: bankKeys.balance(id),
    queryFn: () => bankApi.getBankBalance(id),
    enabled: !!id,
  });
}

export function useAccountNames() {
  return useQuery({
    queryKey: bankKeys.accountNames(),
    queryFn: () => bankApi.getAccountNames(),
  });
}

// Bank mutations
export function useCreateBankBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankBalanceRequest) => bankApi.createBankBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankKeys.balances() });
      queryClient.invalidateQueries({ queryKey: bankKeys.accountNames() });
    },
  });
}

export function useUpdateBankBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBankBalanceRequest> }) =>
      bankApi.updateBankBalance(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: bankKeys.balance(id) });
      queryClient.invalidateQueries({ queryKey: bankKeys.balances() });
      queryClient.invalidateQueries({ queryKey: bankKeys.accountNames() });
    },
  });
}

export function useDeleteBankBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankApi.deleteBankBalance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankKeys.balances() });
      queryClient.invalidateQueries({ queryKey: bankKeys.accountNames() });
    },
  });
}

export function useImportCsv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => bankApi.importCsv(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankKeys.balances() });
      queryClient.invalidateQueries({ queryKey: bankKeys.accountNames() });
    },
  });
}

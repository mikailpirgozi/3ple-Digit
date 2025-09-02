import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { liabilitiesApi } from './api';
import {
  Liability,
  CreateLiabilityRequest,
} from '@/types/api';

// Query keys factory
export const liabilitiesKeys = {
  all: ['liabilities'] as const,
  lists: () => [...liabilitiesKeys.all, 'list'] as const,
  list: () => [...liabilitiesKeys.lists()] as const,
  details: () => [...liabilitiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...liabilitiesKeys.details(), id] as const,
};

// Liabilities queries
export function useLiabilities() {
  return useQuery({
    queryKey: liabilitiesKeys.list(),
    queryFn: () => liabilitiesApi.getLiabilities(),
  });
}

export function useLiability(id: string) {
  return useQuery({
    queryKey: liabilitiesKeys.detail(id),
    queryFn: () => liabilitiesApi.getLiability(id),
    enabled: !!id,
  });
}

// Liabilities mutations
export function useCreateLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLiabilityRequest) => liabilitiesApi.createLiability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liabilitiesKeys.lists() });
    },
  });
}

export function useUpdateLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLiabilityRequest> }) =>
      liabilitiesApi.updateLiability(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: liabilitiesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: liabilitiesKeys.lists() });
    },
  });
}

export function useDeleteLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => liabilitiesApi.deleteLiability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liabilitiesKeys.lists() });
    },
  });
}

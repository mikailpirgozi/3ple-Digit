import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { snapshotsApi } from './api';
import {
  PeriodSnapshot,
  CreateSnapshotRequest,
  SnapshotFilters,
} from '@/types/api';

// Query keys factory
export const snapshotsKeys = {
  all: ['snapshots'] as const,
  lists: () => [...snapshotsKeys.all, 'list'] as const,
  list: (filters?: SnapshotFilters) => [...snapshotsKeys.lists(), filters] as const,
  details: () => [...snapshotsKeys.all, 'detail'] as const,
  detail: (id: string) => [...snapshotsKeys.details(), id] as const,
  currentNav: () => [...snapshotsKeys.all, 'current-nav'] as const,
};

// Snapshots queries
export function useSnapshots(filters?: SnapshotFilters) {
  return useQuery({
    queryKey: snapshotsKeys.list(filters),
    queryFn: () => snapshotsApi.getSnapshots(filters),
  });
}

export function useSnapshot(id: string) {
  return useQuery({
    queryKey: snapshotsKeys.detail(id),
    queryFn: () => snapshotsApi.getSnapshot(id),
    enabled: !!id,
  });
}

export function useCurrentNav() {
  return useQuery({
    queryKey: snapshotsKeys.currentNav(),
    queryFn: () => snapshotsApi.getCurrentNav(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Snapshots mutations
export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSnapshotRequest) => snapshotsApi.createSnapshot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snapshotsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: snapshotsKeys.currentNav() });
    },
  });
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => snapshotsApi.deleteSnapshot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snapshotsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: snapshotsKeys.currentNav() });
    },
  });
}

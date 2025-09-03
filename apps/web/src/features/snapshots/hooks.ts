import type { CreateSnapshotRequest, SnapshotFilters } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { snapshotsApi } from './api';

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
    enabled: Boolean(id),
  });
}

export function useCurrentNav() {
  return useQuery({
    queryKey: snapshotsKeys.currentNav(),
    queryFn: () => snapshotsApi.getCurrentNav(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useLatestSnapshots(limit: number = 2) {
  return useQuery({
    queryKey: [...snapshotsKeys.all, 'latest', limit],
    queryFn: () => snapshotsApi.getSnapshots({ limit, page: 1 }),
    refetchInterval: 60000, // Refresh every minute
  });
}

// Snapshots mutations
export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSnapshotRequest) => snapshotsApi.createSnapshot(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: snapshotsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: snapshotsKeys.currentNav() });
    },
  });
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => snapshotsApi.deleteSnapshot(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: snapshotsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: snapshotsKeys.currentNav() });
    },
  });
}

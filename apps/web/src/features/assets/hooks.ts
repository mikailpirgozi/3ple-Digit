import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from './api';
import type {
  CreateAssetRequest,
  CreateAssetEventRequest,
  MarkAssetSoldRequest,
  AssetFilters,
} from '@/types/api';
// Asset and AssetEvent types removed as unused

// Query keys factory
export const assetsKeys = {
  all: ['assets'] as const,
  lists: () => [...assetsKeys.all, 'list'] as const,
  list: (filters?: AssetFilters) => [...assetsKeys.lists(), filters] as const,
  details: () => [...assetsKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetsKeys.details(), id] as const,
  events: (id: string) => [...assetsKeys.detail(id), 'events'] as const,
};

// Assets queries
export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: assetsKeys.list(filters),
    queryFn: () => assetsApi.getAssets(filters),
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: assetsKeys.detail(id),
    queryFn: () => assetsApi.getAsset(id),
    enabled: Boolean(id),
  });
}

export function useAssetEvents(id: string) {
  return useQuery({
    queryKey: assetsKeys.events(id),
    queryFn: () => assetsApi.getAssetEvents(id),
    enabled: Boolean(id),
  });
}

// Assets mutations
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssetRequest) => assetsApi.createAsset(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAssetRequest> }) =>
      assetsApi.updateAsset(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: assetsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assetsApi.deleteAsset(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

// Asset events mutations
export function useCreateAssetEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAssetEventRequest }) =>
      assetsApi.createAssetEvent(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: assetsKeys.events(id) });
      void queryClient.invalidateQueries({ queryKey: assetsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

export function useUpdateAssetEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assetId,
      eventId,
      data,
    }: {
      assetId: string;
      eventId: string;
      data: Partial<CreateAssetEventRequest>;
    }) => assetsApi.updateAssetEvent(assetId, eventId, data),
    onSuccess: (_, { assetId }) => {
      void queryClient.invalidateQueries({ queryKey: assetsKeys.events(assetId) });
      void queryClient.invalidateQueries({ queryKey: assetsKeys.detail(assetId) });
      void queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

export function useDeleteAssetEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, eventId }: { assetId: string; eventId: string }) =>
      assetsApi.deleteAssetEvent(assetId, eventId),
    onSuccess: (_, { assetId }) => {
      void queryClient.invalidateQueries({ queryKey: assetsKeys.events(assetId) });
      void queryClient.invalidateQueries({ queryKey: assetsKeys.detail(assetId) });
      void queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

export function useMarkAssetSold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkAssetSoldRequest }) =>
      assetsApi.markAsSold(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: assetsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

import { api } from '@/lib/api-client';
import type {
  Asset,
  AssetEvent,
  CreateAssetRequest,
  CreateAssetEventRequest,
  MarkAssetSoldRequest,
  AssetSaleResponse,
  AssetFilters,
  AssetsResponse,
  AssetEventsResponse,
} from '@/types/api';

export const assetsApi = {
  // Get all assets with optional filtering
  getAssets: (filters?: AssetFilters): Promise<AssetsResponse> => api.get('/assets', filters),

  // Get asset by ID
  getAsset: (id: string): Promise<Asset> => api.get(`/assets/${id}`),

  // Create new asset
  createAsset: (data: CreateAssetRequest): Promise<Asset> => api.post('/assets', data),

  // Update asset
  updateAsset: (id: string, data: Partial<CreateAssetRequest>): Promise<Asset> =>
    api.put(`/assets/${id}`, data),

  // Delete asset
  deleteAsset: (id: string): Promise<void> => api.delete(`/assets/${id}`),

  // Get asset events
  getAssetEvents: (id: string): Promise<AssetEvent[]> =>
    api.get<AssetEventsResponse>(`/assets/${id}/events`).then(response => response.events),

  // Create asset event
  createAssetEvent: (id: string, data: CreateAssetEventRequest): Promise<AssetEvent> =>
    api.post(`/assets/${id}/events`, data),

  // Update asset event
  updateAssetEvent: (
    assetId: string,
    eventId: string,
    data: Partial<CreateAssetEventRequest>
  ): Promise<AssetEvent> => api.put(`/assets/events/${eventId}`, data),

  // Delete asset event
  deleteAssetEvent: (assetId: string, eventId: string): Promise<void> =>
    api.delete(`/assets/events/${eventId}`),

  // Mark asset as sold
  markAsSold: (id: string, data: MarkAssetSoldRequest): Promise<AssetSaleResponse> =>
    api.post(`/assets/${id}/mark-sold`, data),
};

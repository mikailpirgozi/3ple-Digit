import { api } from '@/lib/api-client';
import type {
  AssetResponse,
  AssetEvent,
  CreateAssetRequest,
  CreateAssetEventRequest,
  MarkAssetSoldRequest,
  AssetSaleResponse,
  AssetFilters,
  AssetsResponse,
  AssetEventsResponse,
  AssetEventValidationInfo,
  LoanStatistics,
} from '@/types/api';

export const assetsApi = {
  // Get all assets with optional filtering
  getAssets: (filters?: AssetFilters): Promise<AssetsResponse> => api.get('/assets', filters),

  // Get asset by ID
  getAsset: (id: string): Promise<AssetResponse> => api.get(`/assets/${id}`),

  // Create new asset
  createAsset: (data: CreateAssetRequest): Promise<AssetResponse> => api.post('/assets', data),

  // Update asset
  updateAsset: (id: string, data: Partial<CreateAssetRequest>): Promise<AssetResponse> =>
    api.put(`/assets/${id}`, data),

  // Delete asset
  deleteAsset: (id: string): Promise<void> => api.delete(`/assets/${id}`),

  // Get asset events
  getAssetEvents: (id: string): Promise<AssetEvent[]> =>
    api.get<AssetEventsResponse>(`/assets/${id}/events`).then((response: AssetEventsResponse) => response.events),

  // Get asset event validation info
  getAssetEventValidationInfo: (id: string): Promise<AssetEventValidationInfo> =>
    api.get(`/assets/${id}/events/validation`),

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

  // Get loan statistics
  getLoanStatistics: (id: string): Promise<LoanStatistics> =>
    api.get(`/assets/${id}/loan-statistics`),
};

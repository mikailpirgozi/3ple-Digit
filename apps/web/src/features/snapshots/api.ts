import { api } from '@/lib/api-client';
import {
  PeriodSnapshot,
  CreateSnapshotRequest,
  CurrentNavResponse,
  SnapshotFilters,
  SnapshotsResponse,
} from '@/types/api';

export const snapshotsApi = {
  // Get all snapshots with optional filtering
  getSnapshots: (filters?: SnapshotFilters): Promise<SnapshotsResponse> =>
    api.get('/snapshots', filters),

  // Get snapshot by ID
  getSnapshot: (id: string): Promise<PeriodSnapshot> => api.get(`/snapshots/${id}`),

  // Create new snapshot
  createSnapshot: (data: CreateSnapshotRequest): Promise<PeriodSnapshot> =>
    api.post('/snapshots', data),

  // Delete snapshot
  deleteSnapshot: (id: string): Promise<void> => api.delete(`/snapshots/${id}`),

  // Get current NAV (real-time calculation)
  getCurrentNav: (): Promise<CurrentNavResponse> => api.get('/snapshots/nav/current'),
};

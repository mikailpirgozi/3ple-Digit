import { api } from '@/lib/api-client';
import { Liability, CreateLiabilityRequest, LiabilitiesResponse } from '@/types/api';

export const liabilitiesApi = {
  // Get all liabilities
  getLiabilities: (): Promise<LiabilitiesResponse> => api.get('/liabilities'),

  // Get liability by ID
  getLiability: (id: string): Promise<Liability> => api.get(`/liabilities/${id}`),

  // Create new liability
  createLiability: (data: CreateLiabilityRequest): Promise<Liability> =>
    api.post('/liabilities', data),

  // Update liability
  updateLiability: (id: string, data: Partial<CreateLiabilityRequest>): Promise<Liability> =>
    api.put(`/liabilities/${id}`, data),

  // Delete liability
  deleteLiability: (id: string): Promise<void> => api.delete(`/liabilities/${id}`),
};

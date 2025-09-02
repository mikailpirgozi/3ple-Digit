import { api } from '@/lib/api-client';
import { 
  Investor,
  InvestorCashflow,
  InvestorOverview,
  CreateInvestorRequest,
  CreateCashflowRequest,
  InvestorFilters,
  PaginatedResponse
} from '@/types/api';

export const investorsApi = {
  // Get all investors with optional filtering
  getInvestors: (filters?: InvestorFilters): Promise<PaginatedResponse<Investor>> =>
    api.get('/investors', filters),

  // Get investor by ID
  getInvestor: (id: string): Promise<Investor> =>
    api.get(`/investors/${id}`),

  // Create new investor
  createInvestor: (data: CreateInvestorRequest): Promise<Investor> =>
    api.post('/investors', data),

  // Update investor
  updateInvestor: (id: string, data: Partial<CreateInvestorRequest>): Promise<Investor> =>
    api.put(`/investors/${id}`, data),

  // Delete investor
  deleteInvestor: (id: string): Promise<void> =>
    api.delete(`/investors/${id}`),

  // Get investor overview (capital, percent, history)
  getInvestorOverview: (id: string): Promise<InvestorOverview> =>
    api.get(`/investors/${id}/overview`),

  // Get investor cashflows
  getInvestorCashflows: (id: string): Promise<InvestorCashflow[]> =>
    api.get(`/investors/${id}/cashflows`),

  // Create cashflow for investor
  createCashflow: (id: string, data: CreateCashflowRequest): Promise<InvestorCashflow> =>
    api.post(`/investors/${id}/cashflows`, data),

  // Update cashflow
  updateCashflow: (investorId: string, cashflowId: string, data: Partial<CreateCashflowRequest>): Promise<InvestorCashflow> =>
    api.put(`/investors/${investorId}/cashflows/${cashflowId}`, data),

  // Delete cashflow
  deleteCashflow: (investorId: string, cashflowId: string): Promise<void> =>
    api.delete(`/investors/${investorId}/cashflows/${cashflowId}`),
};

import { api } from '@/lib/api-client';
import { 
  BankBalance,
  CreateBankBalanceRequest,
  CsvImportResponse,
  BankFilters,
  PaginatedResponse
} from '@/types/api';

export const bankApi = {
  // Get all bank balances with optional filtering
  getBankBalances: (filters?: BankFilters): Promise<PaginatedResponse<BankBalance>> =>
    api.get('/bank/balances', filters),

  // Get bank balance by ID
  getBankBalance: (id: string): Promise<BankBalance> =>
    api.get(`/bank/balances/${id}`),

  // Create new bank balance
  createBankBalance: (data: CreateBankBalanceRequest): Promise<BankBalance> =>
    api.post('/bank/balances', data),

  // Update bank balance
  updateBankBalance: (id: string, data: Partial<CreateBankBalanceRequest>): Promise<BankBalance> =>
    api.put(`/bank/balances/${id}`, data),

  // Delete bank balance
  deleteBankBalance: (id: string): Promise<void> =>
    api.delete(`/bank/balances/${id}`),

  // Import bank balances from CSV
  importCsv: (file: File): Promise<CsvImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/bank/import-csv', formData);
  },

  // Get unique account names for filtering
  getAccountNames: (): Promise<string[]> =>
    api.get('/bank/account-names'),
};

// API Types based on backend schemas

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'INTERNAL' | 'INVESTOR';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'INTERNAL' | 'INVESTOR';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Investor types
export interface Investor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
  totalCapital: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface InvestorCashflow {
  id: string;
  investorId: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  note?: string;
  createdAt: string;
}

export interface InvestorOverview {
  capital: number;
  percent: number;
  cashflows: InvestorCashflow[];
  history: Array<{
    date: string;
    capital: number;
    percent: number;
  }>;
}

export interface CreateInvestorRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface CreateCashflowRequest {
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  note?: string;
}

// Asset types
export type AssetType =
  | 'loan'
  | 'real_estate'
  | 'vehicle'
  | 'stock'
  | 'inventory'
  | 'share_in_company';
export type AssetStatus = 'ACTIVE' | 'SOLD';

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  acquiredPrice?: number;
  currentValue: number;
  expectedSalePrice?: number;
  status: AssetStatus;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type AssetEventKind = 'VALUATION' | 'PAYMENT_IN' | 'PAYMENT_OUT' | 'CAPEX' | 'NOTE';

export interface AssetEvent {
  id: string;
  assetId: string;
  date: string;
  kind: AssetEventKind;
  amount?: number;
  note?: string;
  createdAt: string;
}

export interface CreateAssetRequest {
  type: AssetType;
  name: string;
  acquiredPrice?: number;
  currentValue: number;
  expectedSalePrice?: number;
  meta?: Record<string, unknown>;
}

export interface CreateAssetEventRequest {
  date: string;
  kind: AssetEventKind;
  amount?: number;
  note?: string;
}

export interface MarkAssetSoldRequest {
  date: string;
  salePrice: number;
}

export interface AssetSaleResponse {
  id: string;
  status: AssetStatus;
  pnl: number;
}

// Liability types
export interface Liability {
  id: string;
  name: string;
  currentBalance: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLiabilityRequest {
  name: string;
  currentBalance: number;
  note?: string;
}

// Bank types
export interface BankBalance {
  id: string;
  accountName: string;
  date: string;
  amount: number;
  currency: 'EUR';
  createdAt: string;
}

export interface CreateBankBalanceRequest {
  accountName: string;
  date: string;
  amount: number;
}

export interface CsvImportResponse {
  imported: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// Snapshot types
export interface PeriodSnapshot {
  id: string;
  date: string;
  totalAssetValue: number;
  totalBankBalance: number;
  totalLiabilities: number;
  nav: number;
  performanceFeeRate?: number;
  totalPerformanceFee?: number;
  createdAt: string;
  updatedAt: string;
  investorSnapshots: InvestorSnapshot[];
}

export interface InvestorSnapshot {
  id: string;
  investorId: string;
  capitalAmount: number;
  ownershipPercent: number;
  performanceFee?: number;
  investor: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SnapshotsResponse {
  snapshots: PeriodSnapshot[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSnapshotRequest {
  date: string;
  performanceFeeRate?: number;
}

export interface CurrentNavResponse {
  totalAssetValue: number;
  totalBankBalance: number;
  totalLiabilities: number;
  nav: number;
  assetBreakdown: Array<{
    type: string;
    count: number;
    totalValue: number;
  }>;
  bankBreakdown: Array<{
    currency: string;
    totalAmount: number;
  }>;
  liabilityBreakdown: Array<{
    name: string;
    currentBalance: number;
  }>;
}

// Document types
export type DocumentLinkedType = 'asset' | 'investor' | 'liability';

export interface Document {
  id: string;
  title: string;
  r2Key: string;
  mime: string;
  size: number;
  sha256: string;
  linkedType: DocumentLinkedType;
  linkedId: string;
  note?: string;
  createdAt: string;
}

export interface PresignUploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  category?: string;
}

export interface PresignUploadResponse {
  uploadUrl: string;
  fields?: Record<string, string>;
  document: {
    id: string;
    r2Key: string;
    title: string;
  };
}

// Report types
export interface PortfolioReport {
  totalValue: number;
  assetsByType: Array<{
    type: AssetType;
    count: number;
    value: number;
    percentage: number;
  }>;
  topAssets: Array<{
    id: string;
    name: string;
    type: AssetType;
    value: number;
  }>;
}

export interface InvestorReport {
  totalInvestors: number;
  totalCapital: number;
  averageCapital: number;
  investors: Array<{
    id: string;
    name: string;
    email: string;
    totalDeposits: number;
    totalWithdrawals: number;
    capitalAmount: number;
    ownershipPercent: number;
    lastActivity: string | null;
  }>;
  capitalDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface PerformanceReport {
  currentNav: number;
  previousNav: number | null;
  navChange: number | null;
  navChangePercent: number | null;
  totalAssets: number;
  totalLiabilities: number;
  totalBankBalance: number;
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  soldAssetsCount: number;
  snapshots: Array<{
    date: string;
    nav: number;
    totalAssetValue: number;
    totalBankBalance: number;
    totalLiabilities: number;
  }>;
  performanceFees: {
    totalCollected: number;
    averageRate: number;
    byPeriod: Array<{
      period: string;
      amount: number;
      rate: number;
    }>;
  };
}

export interface CashflowReport {
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
  byPeriod: Array<{
    period: string;
    inflows: number;
    outflows: number;
    netFlow: number;
  }>;
  byType: {
    deposits: number;
    withdrawals: number;
    assetPayments: number;
    expenses: number;
  };
  topInflows: Array<{
    source: string;
    amount: number;
    date: string;
  }>;
  topOutflows: Array<{
    destination: string;
    amount: number;
    date: string;
  }>;
}

// Pagination and filtering
export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface InvestorsResponse {
  investors: Investor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Assets Response
export interface AssetsResponse {
  assets: Asset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Bank Response
export interface BankBalancesResponse {
  balances: BankBalance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    byCurrency: Record<string, number>;
  };
}

// Liabilities Response
export interface LiabilitiesResponse {
  liabilities: Liability[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalBalance: number;
    averageInterestRate: number;
    count: number;
  };
}

// Documents Response
export interface DocumentsResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalSize: number;
    totalCount: number;
    byCategory: Record<string, number>;
    byMimeType: Record<string, number>;
  };
}

// Common filters
export interface AssetFilters extends PaginationParams {
  type?: AssetType;
  status?: AssetStatus;
  q?: string; // search query
}

export interface InvestorFilters extends PaginationParams {
  status?: 'active' | 'inactive';
  q?: string;
}

export interface BankFilters extends PaginationParams {
  accountName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SnapshotFilters extends PaginationParams {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
}

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
  userId?: string;
  displayName: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
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
  displayName: string;
}

export interface CreateCashflowRequest {
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  note?: string;
}

// Asset types
export type AssetType = 'loan' | 'real_estate' | 'vehicle' | 'stock' | 'inventory' | 'share_in_company';
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
  period: string; // 'YYYY-MM'
  nav: number;
  totals: {
    assets: number;
    cash: number;
    liabilities: number;
  };
  ownership: Record<string, number>; // investorId -> capital
  fee?: {
    rate: number;
    amount: number;
    allocation: Record<string, number>;
  };
  createdAt: string;
}

export interface CreateSnapshotRequest {
  period: string;
  performanceFeeRate?: number;
}

export interface CurrentNavResponse {
  nav: number;
  totals: {
    assets: number;
    cash: number;
    liabilities: number;
  };
  asOfDate: string;
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
  totalCapital: number;
  investorCount: number;
  investors: Array<{
    id: string;
    displayName: string;
    capital: number;
    percentage: number;
    lastActivity: string;
  }>;
}

export interface PerformanceReport {
  period: string;
  nav: number;
  navChange: number;
  navChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
}

export interface CashflowReport {
  period: string;
  deposits: number;
  withdrawals: number;
  netCashflow: number;
  assetCashflows: {
    paymentsIn: number;
    paymentsOut: number;
    capex: number;
  };
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

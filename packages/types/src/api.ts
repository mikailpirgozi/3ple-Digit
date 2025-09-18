import { z } from 'zod';

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common validation schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

// Asset types
export interface CreateAssetRequest {
  name: string;
  type: AssetType;
  category?: string;
  description?: string;
  currentValue: number;
  expectedSalePrice?: number;
  meta?: Record<string, unknown>;
  acquiredPrice?: number;
}

export interface UpdateAssetRequest {
  name?: string;
  type?: AssetType;
  category?: string;
  description?: string;
  currentValue?: number;
  expectedSalePrice?: number;
  meta?: Record<string, unknown>;
  acquiredPrice?: number;
  status?: 'ACTIVE' | 'SOLD';
  salePrice?: number;
  saleDate?: Date;
}

export interface CreateAssetEventRequest {
  assetId: string;
  type: AssetEventKind;
  amount: number;
  date: string;
  note?: string;
}

export interface UpdateAssetEventRequest {
  type?: AssetEventKind;
  amount?: number;
  date?: string;
  note?: string;
}

// Bank types
export interface CreateBankBalanceRequest {
  accountName: string;
  amount: number;
  currency: string;
  bankName?: string;
  date: string;
}

export interface UpdateBankBalanceRequest {
  accountName?: string;
  amount?: number;
  currency?: string;
  bankName?: string;
  date?: string;
}

// Investor types
export interface CreateInvestorRequest {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  taxId?: string;
}

export interface UpdateInvestorRequest {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  taxId?: string;
}

export interface CreateCashflowRequest {
  investorId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  date: string;
  note?: string;
}

// Liability types
export interface CreateLiabilityRequest {
  name: string;
  currentBalance: number;
  note?: string;
}

export interface UpdateLiabilityRequest {
  name?: string;
  currentBalance?: number;
  note?: string;
}

// Snapshot types
export interface CreateSnapshotRequest {
  date: string;
  performanceFeeRate?: number;
}

// Response types
export interface AssetResponse {
  id: string;
  name: string;
  type: AssetType;
  category?: string;
  description?: string | null;
  currentValue: number;
  expectedSalePrice?: number;
  meta?: Record<string, unknown>;
  status?: string;
  acquiredPrice?: number | null;
  salePrice?: number | null;
  saleDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  eventsCount?: number;
  totalInflows?: number;
  totalOutflows?: number;
}

export interface AssetEventResponse {
  id: string;
  assetId: string;
  type: AssetEventKind;
  amount: number;
  date: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  asset?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface BankBalanceResponse {
  id: string;
  accountName: string;
  amount: number;
  currency: string;
  bankName?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestorResponse {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  taxId?: string;
  createdAt: Date;
  updatedAt: Date;
  totalCapital?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  ownershipPercent?: number;
  capitalAmount?: number;
  lastActivity?: Date;
}

export interface LiabilityResponse {
  id: string;
  name: string;
  currentBalance: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotResponse {
  id: string;
  date: Date;
  nav: number;
  totalAssetValue: number;
  totalBankBalance: number;
  totalLiabilities: number;
  performanceFeeRate?: number;
  totalPerformanceFee?: number;
  investorSnapshots?: InvestorSnapshot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CashflowResponse {
  id: string;
  investorId: string;
  type: string;
  amount: number;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Document types
export interface CreateDocumentRequest {
  title: string;
  linkedType: 'asset' | 'investor' | 'liability';
  linkedId: string;
  note?: string;
}

export interface DocumentResponse {
  id: string;
  title: string;
  linkedType: string;
  linkedId: string;
  note?: string;
  r2Key: string;
  mimeType: string;
  mime: string;
  size: number;
  sha256: string;
  createdAt: Date;
  updatedAt: Date;
}

// Filter types
export interface AssetFilters {
  search?: string;
  q?: string;
  type?: string;
  status?: 'ACTIVE' | 'SOLD';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface BankFilters {
  accountName?: string;
  bankName?: string;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface InvestorFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface SnapshotFilters {
  dateFrom?: string;
  dateTo?: string;
  period?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// Entity types (aliases for responses)
export type Asset = AssetResponse;
export type AssetEvent = AssetEventResponse;
export type BankBalance = BankBalanceResponse;
export type Investor = InvestorResponse;
export type Liability = LiabilityResponse;
export type Snapshot = SnapshotResponse;
export type Cashflow = CashflowResponse;
export type Document = DocumentResponse;

// Linked type for documents
export type DocumentLinkedType = 'asset' | 'investor' | 'liability';

// Document linked type with index signature for dynamic access
export type DocumentLinkedTypeRecord<T> = Record<DocumentLinkedType, T> & { [key: string]: T };

// Asset event kind
export type AssetEventKind = 'VALUATION' | 'PAYMENT_IN' | 'PAYMENT_OUT' | 'CAPEX' | 'NOTE' | 'SALE';

// Asset type enum
export type AssetType =
  | 'PÔŽIČKY'
  | 'NEHNUTEĽNOSTI'
  | 'AUTÁ'
  | 'AKCIE'
  | 'MATERIÁL'
  | 'PODIEL VO FIRME';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  accessToken: string;
}

export type UserRole = 'ADMIN' | 'INTERNAL' | 'INVESTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Asset sale types
export interface MarkAssetSoldRequest {
  salePrice: number;
  saleDate: string;
  date: string;
}

export interface AssetSaleResponse {
  id: string;
  name: string;
  type: string;
  salePrice: number;
  saleDate: Date;
  status: 'SOLD';
}

// Collection response types
export interface AssetsResponse {
  assets: AssetResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BankBalancesResponse {
  balances: BankBalanceResponse[];
  items: BankBalanceResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InvestorsResponse {
  investors: InvestorResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LiabilitiesResponse {
  liabilities: LiabilityResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SnapshotsResponse {
  snapshots: SnapshotResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DocumentsResponse {
  documents: DocumentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Summary types
export interface BankSummary {
  totalBalance: number;
  currency: string;
  accountsCount: number;
  byAccount: BankAccountSummary[];
  lastUpdated: Date;
}

export interface BankAccountSummary {
  accountName: string;
  balance: number;
  amount: number;
  currency: string;
  bankName?: string;
}

export interface LiabilitiesSummary {
  totalBalance: number;
  liabilitiesCount: number;
  lastUpdated: Date;
}

// Investor cashflow and overview
export interface InvestorCashflow {
  id: string;
  investorId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestorOverview {
  id: string;
  name: string;
  email: string;
  totalDeposits: number;
  totalWithdrawals: number;
  netContribution: number;
  currentValue: number;
  ownershipPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

// Period snapshot
export interface PeriodSnapshot {
  id: string;
  date: Date;
  performanceFeeRate?: number;
  totalNav: number;
  totalInvestorCapital: number;
  performanceFee: number;
  investorSnapshots: InvestorSnapshot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestorSnapshot {
  id: string;
  investorId: string;
  snapshotId: string;
  capital: number;
  ownershipPercentage: number;
  performanceFee: number;
  createdAt: Date;
  updatedAt: Date;
}

// Current NAV response
export interface CurrentNavResponse {
  nav: number;
  totalNav: number;
  totalAssetValue: number;
  totalBankBalance: number;
  totalLiabilities: number;
  totalInvestorCapital: number;
  performanceFee: number;
  assetBreakdown: AssetBreakdown[];
  lastSnapshotDate?: Date;
}

// Document upload types
export interface PresignUploadRequest {
  fileName: string;
  mimeType: string;
  fileType: string;
  size: number;
  fileSize: number;
  linkedType: DocumentLinkedType;
  linkedId: string;
}

export interface PresignUploadResponse {
  uploadUrl: string;
  r2Key: string;
  expiresAt: Date;
  fields: Record<string, string>;
  document: DocumentResponse;
}

// CSV import response
export interface CsvImportResponse {
  success: boolean;
  processed: number;
  imported: number;
  errors: { row: number; message: string }[];
  warnings: string[];
}

// Report types
export interface PortfolioReport {
  totalValue: number;
  totalNav: number;
  totalInvestorCapital: number;
  performanceFee: number;
  assetBreakdown: AssetBreakdown[];
  assetsByType: Record<AssetType, number>;
  topAssets: AssetResponse[];
  bankBreakdown: BankBreakdown[];
  liabilityBreakdown: LiabilityBreakdown[];
  lastSnapshotDate?: Date;
}

export interface AssetBreakdown {
  type: AssetType;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface BankBreakdown {
  currency: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface LiabilityBreakdown {
  name: string;
  balance: number;
  percentage: number;
}

export interface InvestorReport {
  investor: InvestorResponse;
  investors: InvestorResponse[];
  totalCapital: number;
  totalInvestors: number;
  capital: number;
  ownershipPercentage: number;
  performanceFee: number;
  cashflows: CashflowResponse[];
  totalDeposits: number;
  totalWithdrawals: number;
  netContribution: number;
}

export interface PerformanceReport {
  period: string;
  startDate: Date;
  endDate: Date;
  currentNav: number;
  previousNav: number;
  navChange: number;
  navChangePercent: number;
  totalUnrealizedPnL: number;
  totalReturn: number;
  totalReturnPercentage: number;
  performanceFee: number;
  netReturn: number;
  netReturnPercentage: number;
  investorReturns: InvestorPerformance[];
}

export interface InvestorPerformance {
  investor: InvestorResponse;
  startCapital: number;
  endCapital: number;
  return: number;
  returnPercentage: number;
  performanceFee: number;
  netReturn: number;
  netReturnPercentage: number;
}

export interface CashflowReport {
  period: string;
  startDate: Date;
  endDate: Date;
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
  byType: Record<string, number>;
  topInflows: CashflowEntry[];
  topOutflows: CashflowEntry[];
  inflows: CashflowEntry[];
  outflows: CashflowEntry[];
}

export interface CashflowEntry {
  date: Date;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  investor: InvestorResponse;
  note?: string;
  source?: string;
  destination?: string;
}

import { prisma } from '@/core/prisma.js';
import { errors } from '@/core/error-handler.js';
import { log } from '@/core/logger.js';
import type {
  CreateBankBalanceRequest,
  UpdateBankBalanceRequest,
  CsvImportRequest,
  CsvRowData,
  GetBankBalancesQuery,
  BankBalanceResponse,
  CsvImportResult,
} from './schema.js';
import { csvRowSchema } from './schema.js';

export class BankService {
  /**
   * Create a new bank balance entry
   */
  async createBankBalance(data: CreateBankBalanceRequest, userId?: string): Promise<BankBalanceResponse> {
    const balance = await prisma.bankBalance.create({
      data: {
        accountName: data.accountName,
        bankName: data.bankName,
        accountType: data.accountType,
        amount: data.amount,
        currency: data.currency,
        date: data.date,
      },
    });

    log.info('Bank balance created', { balanceId: balance.id, createdBy: userId });

    return this.formatBankBalanceResponse(balance);
  }

  /**
   * Get all bank balances with pagination and filtering
   */
  async getBankBalances(query: GetBankBalancesQuery): Promise<{
    balances: BankBalanceResponse[];
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
  }> {
    const { page, limit, search, currency, accountName, bankName, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { accountName: { contains: search } },
        { bankName: { contains: search } },
        { accountType: { contains: search } },
      ];
    }
    
    if (currency) {
      where.currency = currency;
    }
    
    if (accountName) {
      where.accountName = { contains: accountName };
    }
    
    if (bankName) {
      where.bankName = { contains: bankName };
    }
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    // Get total count and balances
    const [total, balances] = await Promise.all([
      prisma.bankBalance.count({ where }),
      prisma.bankBalance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    // Calculate summary
    const allBalances = await prisma.bankBalance.findMany({ where });
    const totalAmount = allBalances.reduce((sum, balance) => sum + balance.amount, 0);
    const byCurrency = allBalances.reduce((acc, balance) => {
      acc[balance.currency] = (acc[balance.currency] || 0) + balance.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      balances: balances.map(balance => this.formatBankBalanceResponse(balance)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalAmount,
        byCurrency,
      },
    };
  }

  /**
   * Get bank balance by ID
   */
  async getBankBalanceById(id: string): Promise<BankBalanceResponse> {
    const balance = await prisma.bankBalance.findUnique({
      where: { id },
    });

    if (!balance) {
      throw errors.notFound('Bank balance not found');
    }

    return this.formatBankBalanceResponse(balance);
  }

  /**
   * Update bank balance
   */
  async updateBankBalance(id: string, data: UpdateBankBalanceRequest, userId?: string): Promise<BankBalanceResponse> {
    const existingBalance = await prisma.bankBalance.findUnique({
      where: { id },
    });

    if (!existingBalance) {
      throw errors.notFound('Bank balance not found');
    }

    const balance = await prisma.bankBalance.update({
      where: { id },
      data,
    });

    log.info('Bank balance updated', { balanceId: id, updatedBy: userId });

    return this.formatBankBalanceResponse(balance);
  }

  /**
   * Delete bank balance
   */
  async deleteBankBalance(id: string, userId?: string): Promise<void> {
    const existingBalance = await prisma.bankBalance.findUnique({
      where: { id },
    });

    if (!existingBalance) {
      throw errors.notFound('Bank balance not found');
    }

    await prisma.bankBalance.delete({
      where: { id },
    });

    log.info('Bank balance deleted', { balanceId: id, deletedBy: userId });
  }

  /**
   * Import bank balances from CSV
   */
  async importFromCsv(data: CsvImportRequest, userId?: string): Promise<CsvImportResult> {
    const { file, delimiter, skipFirstRow, mapping } = data;

    try {
      // Decode base64 CSV content
      const csvContent = Buffer.from(file, 'base64').toString('utf-8');
      const rows = csvContent.split('\n').filter(row => row.trim());

      if (rows.length === 0) {
        throw errors.badRequest('CSV file is empty');
      }

      const dataRows = skipFirstRow ? rows.slice(1) : rows;
      const results: CsvImportResult = {
        totalRows: dataRows.length,
        successfulRows: 0,
        failedRows: 0,
        errors: [],
        importedBalances: [],
      };

      // Process each row
      for (let i = 0; i < dataRows.length; i++) {
        const rowIndex = skipFirstRow ? i + 2 : i + 1; // Account for header and 1-based indexing
        const row = dataRows[i];
        
        try {
          const columns = this.parseCsvRow(row, delimiter);
          const rowData = this.mapCsvRow(columns, mapping);
          const validatedData = csvRowSchema.parse(rowData);

          // Create bank balance
          const balance = await prisma.bankBalance.create({
            data: {
              accountName: validatedData.accountName,
              bankName: validatedData.bankName,
              accountType: validatedData.accountType,
              amount: validatedData.amount,
              currency: validatedData.currency,
              date: validatedData.date,
            },
          });

          results.importedBalances.push(this.formatBankBalanceResponse(balance));
          results.successfulRows++;

        } catch (error) {
          results.failedRows++;
          
          let errorMessages: string[] = [];
          if (error instanceof Error) {
            errorMessages = [error.message];
          }

          results.errors.push({
            row: rowIndex,
            errors: errorMessages,
            data: this.parseCsvRowSafe(row, delimiter),
          });
        }
      }

      log.info('CSV import completed', {
        totalRows: results.totalRows,
        successfulRows: results.successfulRows,
        failedRows: results.failedRows,
        importedBy: userId,
      });

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('CSV import failed', { error: errorMessage, userId });
      
      // Re-throw the original error if it's our custom error, otherwise wrap it
      if (error instanceof Error && error.message === 'CSV file is empty') {
        throw error;
      }
      throw errors.badRequest('Failed to process CSV file');
    }
  }

  /**
   * Get bank balance summary by currency
   */
  async getBankBalanceSummary(): Promise<{
    totalBalance: number;
    byCurrency: Record<string, { amount: number; count: number }>;
    byAccount: Array<{ accountName: string; bankName: string | null; amount: number; currency: string }>;
  }> {
    const balances = await prisma.bankBalance.findMany({
      orderBy: { date: 'desc' },
    });

    const totalBalance = balances.reduce((sum, balance) => sum + balance.amount, 0);

    const byCurrency = balances.reduce((acc, balance) => {
      if (!acc[balance.currency]) {
        acc[balance.currency] = { amount: 0, count: 0 };
      }
      acc[balance.currency].amount += balance.amount;
      acc[balance.currency].count++;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    // Group by account (latest balance per account)
    const accountMap = new Map<string, any>();
    balances.forEach(balance => {
      const key = `${balance.accountName}-${balance.bankName || 'unknown'}`;
      if (!accountMap.has(key) || accountMap.get(key).date < balance.date) {
        accountMap.set(key, balance);
      }
    });

    const byAccount = Array.from(accountMap.values()).map(balance => ({
      accountName: balance.accountName,
      bankName: balance.bankName,
      amount: balance.amount,
      currency: balance.currency,
    }));

    return {
      totalBalance,
      byCurrency,
      byAccount,
    };
  }

  /**
   * Parse CSV row into columns
   */
  private parseCsvRow(row: string, delimiter: string): string[] {
    const columns: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        columns.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    columns.push(current.trim());
    return columns;
  }

  /**
   * Safe CSV row parsing (doesn't throw)
   */
  private parseCsvRowSafe(row: string, delimiter: string): Record<string, unknown> {
    try {
      const columns = this.parseCsvRow(row, delimiter);
      return columns.reduce((acc, col, index) => {
        acc[`column_${index}`] = col;
        return acc;
      }, {} as Record<string, unknown>);
    } catch {
      return { raw: row };
    }
  }

  /**
   * Map CSV columns to bank balance data
   */
  private mapCsvRow(columns: string[], mapping: CsvImportRequest['mapping']): CsvRowData {
    const data: any = {};

    // Map required fields
    data.accountName = columns[mapping.accountName]?.trim() || '';
    data.amount = parseFloat(columns[mapping.amount]?.replace(/[^\d.-]/g, '') || '0');
    
    // Parse date
    const dateStr = columns[mapping.date]?.trim() || '';
    data.date = new Date(dateStr);
    
    // Map optional fields
    if (mapping.bankName !== undefined && columns[mapping.bankName]) {
      data.bankName = columns[mapping.bankName].trim();
    }
    
    if (mapping.accountType !== undefined && columns[mapping.accountType]) {
      data.accountType = columns[mapping.accountType].trim();
    }
    
    if (mapping.currency !== undefined && columns[mapping.currency]) {
      data.currency = columns[mapping.currency].trim().toUpperCase();
    } else {
      data.currency = 'EUR';
    }

    return data;
  }

  /**
   * Format bank balance response
   */
  private formatBankBalanceResponse(balance: any): BankBalanceResponse {
    return {
      id: balance.id,
      accountName: balance.accountName,
      bankName: balance.bankName,
      accountType: balance.accountType,
      amount: balance.amount,
      currency: balance.currency,
      date: balance.date,
      createdAt: balance.createdAt,
      updatedAt: balance.updatedAt,
    };
  }
}

export const bankService = new BankService();

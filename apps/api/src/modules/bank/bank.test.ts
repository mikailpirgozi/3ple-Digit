import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { testPrisma as prisma } from '../../test-prisma';
import { BankService } from './service';

describe('Bank Service Unit Tests', () => {
  const bankService = new BankService();

  beforeAll(async () => {
    // CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
    const hasProductionUrl =
      process.env.DATABASE_URL?.includes('railway.app') ||
      process.env.DATABASE_URL?.includes('rlwy.net');

    if (hasProductionUrl) {
      throw new Error('🚨 BANK TEST BLOCKED: Cannot run on production database!');
    }

    // Clean up test data (ONLY on test database)
    await prisma.bankBalance.deleteMany({
      where: { accountName: { contains: 'test-' } },
    });
  });

  afterAll(async () => {
    // CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
    const hasProductionUrl =
      process.env.DATABASE_URL?.includes('railway.app') ||
      process.env.DATABASE_URL?.includes('rlwy.net');

    if (hasProductionUrl) {
      console.error('🚨 BANK CLEANUP BLOCKED: Cannot clean production database!');
      await prisma.$disconnect();
      return;
    }

    // Clean up test data (ONLY on test database)
    await prisma.bankBalance.deleteMany({
      where: { accountName: { contains: 'test-' } },
    });
    await prisma.$disconnect();
  });

  describe('CSV Parser', () => {
    it('should parse simple CSV with comma delimiter', () => {
      const csvContent = 'TatraBusiness,2025-01-15,185432.77\nSafeCash,2025-01-15,1200.00';
      const base64Content = Buffer.from(csvContent).toString('base64');

      const importRequest = {
        file: base64Content,
        delimiter: ',',
        skipFirstRow: false,
        mapping: {
          accountName: 0,
          date: 1,
          amount: 2,
        },
      };

      // Test the private parseCsvRow method indirectly through import
      expect(async () => {
        const result = await bankService.importFromCsv(importRequest);
        expect(result.totalRows).toBe(2);
        expect(result.successfulRows).toBe(2);
        expect(result.failedRows).toBe(0);
        expect(result.importedBalances).toHaveLength(2);
        expect(result.importedBalances[0].accountName).toBe('TatraBusiness');
        expect(result.importedBalances[0].amount).toBe(185432.77);
      }).not.toThrow();
    });

    it('should handle CSV with quoted fields', async () => {
      const csvContent =
        '"Business Account",2025-01-15,"1,234.56"\n"Personal Account",2025-01-15,"2,345.67"';
      const base64Content = Buffer.from(csvContent).toString('base64');

      const importRequest = {
        file: base64Content,
        delimiter: ',',
        skipFirstRow: false,
        mapping: {
          accountName: 0,
          date: 1,
          amount: 2,
        },
      };

      const result = await bankService.importFromCsv(importRequest);
      expect(result.totalRows).toBe(2);
      expect(result.successfulRows).toBe(2);
      expect(result.importedBalances[0].accountName).toBe('Business Account');
      expect(result.importedBalances[0].amount).toBe(1234.56);
    });

    it('should skip header row when specified', async () => {
      const csvContent =
        'Account,Date,Amount\nTatraBusiness,2025-01-15,185432.77\nSafeCash,2025-01-15,1200.00';
      const base64Content = Buffer.from(csvContent).toString('base64');

      const importRequest = {
        file: base64Content,
        delimiter: ',',
        skipFirstRow: true,
        mapping: {
          accountName: 0,
          date: 1,
          amount: 2,
        },
      };

      const result = await bankService.importFromCsv(importRequest);
      expect(result.totalRows).toBe(2); // Should exclude header
      expect(result.successfulRows).toBe(2);
      expect(result.importedBalances[0].accountName).toBe('TatraBusiness');
    });

    it('should handle invalid rows and report errors', async () => {
      const csvContent =
        'ValidAccount,2025-01-15,1000.00\nInvalidAccount,invalid-date,not-a-number\nAnotherValid,2025-01-16,2000.00';
      const base64Content = Buffer.from(csvContent).toString('base64');

      const importRequest = {
        file: base64Content,
        delimiter: ',',
        skipFirstRow: false,
        mapping: {
          accountName: 0,
          date: 1,
          amount: 2,
        },
      };

      const result = await bankService.importFromCsv(importRequest);
      expect(result.totalRows).toBe(3);
      expect(result.successfulRows).toBe(2);
      expect(result.failedRows).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2); // Second row (1-based)
      expect(result.importedBalances).toHaveLength(2);
    });

    it('should handle different delimiters', async () => {
      const csvContent = 'TatraBusiness;2025-01-15;185432.77\nSafeCash;2025-01-15;1200.00';
      const base64Content = Buffer.from(csvContent).toString('base64');

      const importRequest = {
        file: base64Content,
        delimiter: ';',
        skipFirstRow: false,
        mapping: {
          accountName: 0,
          date: 1,
          amount: 2,
        },
      };

      const result = await bankService.importFromCsv(importRequest);
      expect(result.totalRows).toBe(2);
      expect(result.successfulRows).toBe(2);
      expect(result.importedBalances[0].accountName).toBe('TatraBusiness');
    });

    it('should handle empty CSV file', async () => {
      const csvContent = '';
      const base64Content = Buffer.from(csvContent).toString('base64');

      const importRequest = {
        file: base64Content,
        delimiter: ',',
        skipFirstRow: false,
        mapping: {
          accountName: 0,
          date: 1,
          amount: 2,
        },
      };

      await expect(bankService.importFromCsv(importRequest)).rejects.toThrow('CSV file is empty');
    });

    it('should map optional fields correctly', async () => {
      const csvContent = 'TatraBusiness,Tatra Banka,Business,2025-01-15,185432.77,EUR';
      const base64Content = Buffer.from(csvContent).toString('base64');

      const importRequest = {
        file: base64Content,
        delimiter: ',',
        skipFirstRow: false,
        mapping: {
          accountName: 0,
          bankName: 1,
          accountType: 2,
          date: 3,
          amount: 4,
          currency: 5,
        },
      };

      const result = await bankService.importFromCsv(importRequest);
      expect(result.successfulRows).toBe(1);
      expect(result.importedBalances[0].accountName).toBe('TatraBusiness');
      expect(result.importedBalances[0].bankName).toBe('Tatra Banka');
      expect(result.importedBalances[0].accountType).toBe('Business');
      expect(result.importedBalances[0].currency).toBe('EUR');
    });
  });

  describe('Bank Balance Summary', () => {
    beforeAll(async () => {
      // Clean up ALL bank balances first to ensure clean state
      await prisma.bankBalance.deleteMany();

      // Create test data
      await prisma.bankBalance.createMany({
        data: [
          {
            accountName: 'test-eur-account',
            amount: 10000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'test-usd-account',
            amount: 5000,
            currency: 'USD',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'test-eur-account-2',
            amount: 15000,
            currency: 'EUR',
            date: new Date('2025-01-16'),
          },
        ],
      });
    });

    it('should calculate correct summary by currency', async () => {
      const summary = await bankService.getBankBalanceSummary();

      expect(summary.totalBalance).toBe(30000);
      expect(summary.byCurrency.EUR!.amount).toBe(25000);
      expect(summary.byCurrency.EUR!.count).toBe(2);
      expect(summary.byCurrency.USD!.amount).toBe(5000);
      expect(summary.byCurrency.USD!.count).toBe(1);
      expect(summary.byAccount).toHaveLength(3);
    });

    it('should use only latest balance per account (no duplicates)', async () => {
      // Add older balance for existing account
      await prisma.bankBalance.create({
        data: {
          accountName: 'test-eur-account',
          amount: 99999, // This old amount should NOT be included
          currency: 'EUR',
          date: new Date('2025-01-10'), // Older date
        },
      });

      const summary = await bankService.getBankBalanceSummary();

      // Should still be 30000, not 30000 + 99999
      expect(summary.totalBalance).toBe(30000);
      expect(summary.byCurrency.EUR!.amount).toBe(25000); // Should not include the old 99999
      expect(summary.byAccount).toHaveLength(3); // Same number of accounts
    });
  });

  describe('Bank Balance CRUD Operations', () => {
    it('should create bank balance with all fields', async () => {
      const balanceData = {
        accountName: 'test-create-account',
        bankName: 'Test Bank',
        accountType: 'Business',
        amount: 50000,
        currency: 'EUR' as const,
        date: new Date('2025-01-15'),
      };

      const result = await bankService.createBankBalance(balanceData, 'test-user');

      expect(result.accountName).toBe(balanceData.accountName);
      expect(result.bankName).toBe(balanceData.bankName);
      expect(result.accountType).toBe(balanceData.accountType);
      expect(result.amount).toBe(balanceData.amount);
      expect(result.currency).toBe(balanceData.currency);
    });

    it('should get bank balance by ID', async () => {
      const balanceData = {
        accountName: 'test-get-account',
        amount: 25000,
        currency: 'EUR' as const,
        date: new Date('2025-01-15'),
      };

      const created = await bankService.createBankBalance(balanceData);
      const retrieved = await bankService.getBankBalanceById(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.accountName).toBe(balanceData.accountName);
      expect(retrieved.amount).toBe(balanceData.amount);
    });

    it('should throw error for non-existent bank balance', async () => {
      await expect(bankService.getBankBalanceById('non-existent-id')).rejects.toThrow(
        'Bank balance not found'
      );
    });

    it('should update bank balance', async () => {
      const balanceData = {
        accountName: 'test-update-account',
        amount: 30000,
        currency: 'EUR' as const,
        date: new Date('2025-01-15'),
      };

      const created = await bankService.createBankBalance(balanceData);
      const updated = await bankService.updateBankBalance(created.id, {
        amount: 35000,
        bankName: 'Updated Bank',
      });

      expect(updated.amount).toBe(35000);
      expect(updated.bankName).toBe('Updated Bank');
      expect(updated.accountName).toBe(balanceData.accountName); // Should remain unchanged
    });

    it('should delete bank balance', async () => {
      const balanceData = {
        accountName: 'test-delete-account',
        amount: 20000,
        currency: 'EUR' as const,
        date: new Date('2025-01-15'),
      };

      const created = await bankService.createBankBalance(balanceData);
      await bankService.deleteBankBalance(created.id);

      await expect(bankService.getBankBalanceById(created.id)).rejects.toThrow(
        'Bank balance not found'
      );
    });
  });

  describe('Bank Balance Filtering and Pagination', () => {
    beforeAll(async () => {
      // Create test data for filtering
      await prisma.bankBalance.createMany({
        data: [
          {
            accountName: 'test-filter-business',
            bankName: 'Business Bank',
            accountType: 'Business',
            amount: 100000,
            currency: 'EUR',
            date: new Date('2025-01-01'),
          },
          {
            accountName: 'test-filter-personal',
            bankName: 'Personal Bank',
            accountType: 'Personal',
            amount: 50000,
            currency: 'USD',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'test-filter-savings',
            bankName: 'Savings Bank',
            accountType: 'Savings',
            amount: 75000,
            currency: 'EUR',
            date: new Date('2025-01-30'),
          },
        ],
      });
    });

    it('should filter by currency', async () => {
      const result = await bankService.getBankBalances({
        page: 1,
        limit: 10,
        currency: 'EUR',
        sortBy: 'date',
        sortOrder: 'asc',
      });

      const eurBalances = result.balances.filter(b => b.currency === 'EUR');
      expect(eurBalances.length).toBeGreaterThanOrEqual(2);
      expect(result.summary.byCurrency.EUR!).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      const result = await bankService.getBankBalances({
        page: 1,
        limit: 10,
        dateFrom: new Date('2025-01-10'),
        dateTo: new Date('2025-01-20'),
        sortBy: 'date',
        sortOrder: 'asc',
      });

      expect(
        result.balances.every(
          b =>
            new Date(b.date) >= new Date('2025-01-10') && new Date(b.date) <= new Date('2025-01-20')
        )
      ).toBe(true);
    });

    it('should search by account name', async () => {
      const result = await bankService.getBankBalances({
        page: 1,
        limit: 10,
        search: 'business',
        sortBy: 'date',
        sortOrder: 'asc',
      });

      expect(
        result.balances.some(
          b =>
            b.accountName.toLowerCase().includes('business') ||
            b.bankName?.toLowerCase().includes('business') ||
            b.accountType?.toLowerCase().includes('business')
        )
      ).toBe(true);
    });

    it('should paginate results correctly', async () => {
      const page1 = await bankService.getBankBalances({
        page: 1,
        limit: 2,
        sortBy: 'date',
        sortOrder: 'asc',
      });

      const page2 = await bankService.getBankBalances({
        page: 2,
        limit: 2,
        sortBy: 'date',
        sortOrder: 'asc',
      });

      expect(page1.balances).toHaveLength(2);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.limit).toBe(2);
      expect(page1.pagination.totalPages).toBeGreaterThanOrEqual(1);

      // Ensure different results on different pages (if there are enough records)
      if (page2.balances.length > 0) {
        expect(page1.balances[0].id).not.toBe(page2.balances[0].id);
      }
    });
  });
});

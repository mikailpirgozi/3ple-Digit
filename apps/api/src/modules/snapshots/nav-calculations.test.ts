import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { testPrisma as prisma } from '../../test-prisma.js';
import { SnapshotsService } from './service.js';

describe('NAV Calculations Unit Tests', () => {
  const snapshotsService = new SnapshotsService();

  beforeAll(async () => {
    // Clean up test data
    await prisma.investorSnapshot.deleteMany();
    await prisma.periodSnapshot.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.bankBalance.deleteMany();
    await prisma.liability.deleteMany();
    await prisma.investorCashflow.deleteMany();
    await prisma.investor.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { contains: 'test.com' } },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.investorSnapshot.deleteMany();
    await prisma.periodSnapshot.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.bankBalance.deleteMany();
    await prisma.liability.deleteMany();
    await prisma.investorCashflow.deleteMany();
    await prisma.investor.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { contains: 'test.com' } },
    });
    await prisma.$disconnect();
  });

  describe('NAV Calculation Formula: NAV = Σ assets + Σ bank - Σ liabilities', () => {
    beforeEach(async () => {
      // CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
      const hasProductionUrl =
        process.env.DATABASE_URL?.includes('railway.app') ||
        process.env.DATABASE_URL?.includes('rlwy.net');

      if (hasProductionUrl) {
        throw new Error('🚨 TEST BLOCKED: Cannot run tests on production database!');
      }

      // Clean up before each test to ensure isolation (ONLY on test database)
      await prisma.assetEvent.deleteMany();
      await prisma.asset.deleteMany();
      await prisma.bankBalance.deleteMany();
      await prisma.liability.deleteMany();
    });

    it('should calculate NAV with zero values', async () => {
      const nav = await snapshotsService.calculateCurrentNav();

      expect(nav.totalAssetValue).toBe(0);
      expect(nav.totalBankBalance).toBe(0);
      expect(nav.totalLiabilities).toBe(0);
      expect(nav.nav).toBe(0);
      expect(nav.assetBreakdown).toHaveLength(0);
      expect(nav.bankBreakdown).toHaveLength(0);
      expect(nav.liabilityBreakdown).toHaveLength(0);
    });

    it('should calculate NAV with only assets', async () => {
      // Create test assets
      await prisma.asset.createMany({
        data: [
          { name: 'Real Estate 1', type: 'real_estate', currentValue: 100000 },
          { name: 'Stock Portfolio', type: 'stock', currentValue: 50000 },
          { name: 'Loan Asset', type: 'loan', currentValue: 25000 },
        ],
      });

      const nav = await snapshotsService.calculateCurrentNav();

      expect(nav.totalAssetValue).toBe(175000);
      expect(nav.totalBankBalance).toBe(0);
      expect(nav.totalLiabilities).toBe(0);
      expect(nav.nav).toBe(175000); // 175000 + 0 - 0
      expect(nav.assetBreakdown).toHaveLength(3);

      // Check asset breakdown
      const realEstateBreakdown = nav.assetBreakdown.find(a => a.type === 'real_estate');
      expect(realEstateBreakdown?.totalValue).toBe(100000);
      expect(realEstateBreakdown?.count).toBe(1);
    });

    it('should calculate NAV with assets and bank balances', async () => {
      // Create fresh assets for this test
      await prisma.asset.createMany({
        data: [
          { name: 'Real Estate Property', type: 'real_estate', currentValue: 100000 },
          { name: 'Stock Portfolio', type: 'stock', currentValue: 75000 },
        ],
      });

      // Add bank balances
      await prisma.bankBalance.createMany({
        data: [
          {
            accountName: 'Business Account',
            amount: 50000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'Savings Account',
            amount: 30000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
        ],
      });

      const nav = await snapshotsService.calculateCurrentNav();

      expect(nav.totalAssetValue).toBe(175000); // From previous test
      expect(nav.totalBankBalance).toBe(80000);
      expect(nav.totalLiabilities).toBe(0);
      expect(nav.nav).toBe(255000); // 175000 + 80000 - 0
      expect(nav.bankBreakdown).toHaveLength(1);
      expect(nav.bankBreakdown[0].currency).toBe('EUR');
      expect(nav.bankBreakdown[0].totalAmount).toBe(80000);
    });

    it('should calculate NAV with assets, bank balances, and liabilities', async () => {
      // Create fresh assets for this test
      await prisma.asset.createMany({
        data: [
          { name: 'Real Estate Property', type: 'real_estate', currentValue: 100000 },
          { name: 'Stock Portfolio', type: 'stock', currentValue: 75000 },
        ],
      });

      // Add bank balances
      await prisma.bankBalance.createMany({
        data: [
          {
            accountName: 'Business Account',
            amount: 50000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'Savings Account',
            amount: 30000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
        ],
      });

      // Add liabilities
      await prisma.liability.createMany({
        data: [
          { name: 'Mortgage', currentBalance: 120000 },
          { name: 'Business Loan', currentBalance: 35000 },
        ],
      });

      const nav = await snapshotsService.calculateCurrentNav();

      expect(nav.totalAssetValue).toBe(175000);
      expect(nav.totalBankBalance).toBe(80000);
      expect(nav.totalLiabilities).toBe(155000);
      expect(nav.nav).toBe(100000); // 175000 + 80000 - 155000
      expect(nav.liabilityBreakdown).toHaveLength(2);

      const mortgageBreakdown = nav.liabilityBreakdown.find(l => l.name === 'Mortgage');
      expect(mortgageBreakdown?.currentBalance).toBe(120000);
    });

    it('should handle negative NAV correctly', async () => {
      // Create fresh assets for this test
      await prisma.asset.createMany({
        data: [
          { name: 'Real Estate Property', type: 'real_estate', currentValue: 100000 },
          { name: 'Stock Portfolio', type: 'stock', currentValue: 75000 },
        ],
      });

      // Add bank balances
      await prisma.bankBalance.createMany({
        data: [
          {
            accountName: 'Business Account',
            amount: 50000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'Savings Account',
            amount: 30000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
        ],
      });

      // Add liabilities to make NAV negative
      await prisma.liability.createMany({
        data: [
          { name: 'Mortgage', currentBalance: 120000 },
          { name: 'Business Loan', currentBalance: 35000 },
        ],
      });

      // Add more liabilities to make NAV negative
      await prisma.liability.create({
        data: { name: 'Large Debt', currentBalance: 200000 },
      });

      const nav = await snapshotsService.calculateCurrentNav();

      expect(nav.totalAssetValue).toBe(175000);
      expect(nav.totalBankBalance).toBe(80000);
      expect(nav.totalLiabilities).toBe(355000); // 155000 + 200000
      expect(nav.nav).toBe(-100000); // 175000 + 80000 - 355000
    });

    it('should use latest bank balance per account', async () => {
      // Add older balance for same account
      await prisma.bankBalance.create({
        data: {
          accountName: 'Business Account',
          amount: 10000, // Older, smaller amount
          currency: 'EUR',
          date: new Date('2025-01-01'), // Earlier date
        },
      });

      // Add newer balance for same account
      await prisma.bankBalance.create({
        data: {
          accountName: 'Business Account',
          amount: 90000, // Newer, larger amount
          currency: 'EUR',
          date: new Date('2025-01-20'), // Later date
        },
      });

      // Add different account for total calculation
      await prisma.bankBalance.create({
        data: {
          accountName: 'Savings Account',
          amount: 30000,
          currency: 'EUR',
          date: new Date('2025-01-15'),
        },
      });

      const nav = await snapshotsService.calculateCurrentNav();

      // Should use the latest balance (90000) not the older one (10000 or 50000)
      // Total should be: 90000 (latest Business Account) + 30000 (Savings Account) = 120000
      expect(nav.totalBankBalance).toBe(120000);
    });
  });

  describe('Investor Ownership Percentage Calculations', () => {
    beforeAll(async () => {
      // Clean up investors for this test
      await prisma.investorCashflow.deleteMany();
      await prisma.investor.deleteMany();
      await prisma.user.deleteMany({
        where: { email: { contains: 'test.com' } },
      });
    });

    it('should calculate ownership with equal investments', async () => {
      // Create users first
      const user1 = await prisma.user.create({
        data: { name: 'User A', email: 'usera@test.com', password: 'test123', role: 'INVESTOR' },
      });

      const user2 = await prisma.user.create({
        data: { name: 'User B', email: 'userb@test.com', password: 'test123', role: 'INVESTOR' },
      });

      // Create investors with equal capital
      const investor1 = await prisma.investor.create({
        data: { userId: user1.id, name: 'Investor A', email: 'a@test.com' },
      });

      const investor2 = await prisma.investor.create({
        data: { userId: user2.id, name: 'Investor B', email: 'b@test.com' },
      });

      // Equal deposits
      await prisma.investorCashflow.createMany({
        data: [
          { investorId: investor1.id, type: 'DEPOSIT', amount: 50000, date: new Date() },
          { investorId: investor2.id, type: 'DEPOSIT', amount: 50000, date: new Date() },
        ],
      });

      const ownership = await snapshotsService.calculateInvestorOwnership();

      expect(ownership).toHaveLength(2);
      expect(ownership[0].capitalAmount).toBe(50000);
      expect(ownership[0].ownershipPercent).toBe(50);
      expect(ownership[1].capitalAmount).toBe(50000);
      expect(ownership[1].ownershipPercent).toBe(50);

      // Verify total ownership is 100%
      const totalOwnership = ownership.reduce((sum, o) => sum + o.ownershipPercent, 0);
      expect(totalOwnership).toBe(100);
    });

    it('should calculate ownership with unequal investments', async () => {
      // Add more investment for investor A
      await prisma.investorCashflow.create({
        data: {
          investorId: (await prisma.investor.findFirst({ where: { email: 'a@test.com' } }))!.id,
          type: 'DEPOSIT',
          amount: 100000, // Additional investment
          date: new Date(),
        },
      });

      const ownership = await snapshotsService.calculateInvestorOwnership();

      // Investor A: 150000 capital (75%), Investor B: 50000 capital (25%)
      const investorA = ownership.find(o => o.email === 'a@test.com');
      const investorB = ownership.find(o => o.email === 'b@test.com');

      expect(investorA?.capitalAmount).toBe(150000);
      expect(investorA?.ownershipPercent).toBe(75);
      expect(investorB?.capitalAmount).toBe(50000);
      expect(investorB?.ownershipPercent).toBe(25);
    });

    it('should handle withdrawals in ownership calculation', async () => {
      // Investor B makes a withdrawal
      await prisma.investorCashflow.create({
        data: {
          investorId: (await prisma.investor.findFirst({ where: { email: 'b@test.com' } }))!.id,
          type: 'WITHDRAWAL',
          amount: 25000,
          date: new Date(),
        },
      });

      const ownership = await snapshotsService.calculateInvestorOwnership();

      // Investor A: 150000 capital, Investor B: 25000 capital (50000 - 25000)
      const investorA = ownership.find(o => o.email === 'a@test.com');
      const investorB = ownership.find(o => o.email === 'b@test.com');

      expect(investorA?.capitalAmount).toBe(150000);
      expect(investorB?.capitalAmount).toBe(25000);

      // Total capital: 175000, so A = 85.71%, B = 14.29%
      expect(investorA?.ownershipPercent).toBeCloseTo(85.71, 1);
      expect(investorB?.ownershipPercent).toBeCloseTo(14.29, 1);
    });

    it('should handle zero total capital', async () => {
      // Create user first
      const user3 = await prisma.user.create({
        data: { name: 'User C', email: 'userc@test.com', password: 'test123', role: 'INVESTOR' },
      });

      // Create investor with no cashflows
      await prisma.investor.create({
        data: { userId: user3.id, name: 'Investor C', email: 'c@test.com' },
      });

      // Remove all existing cashflows to test zero capital scenario
      await prisma.investorCashflow.deleteMany();

      const ownership = await snapshotsService.calculateInvestorOwnership();

      // All investors should have 0% ownership when no capital exists
      expect(ownership.every(o => o.ownershipPercent === 0)).toBe(true);
      expect(ownership.every(o => o.capitalAmount === 0)).toBe(true);
    });
  });

  describe('Performance Fee Calculations (50/50 split)', () => {
    beforeAll(async () => {
      // Reset data for performance fee tests
      await prisma.investorSnapshot.deleteMany();
      await prisma.periodSnapshot.deleteMany();
      await prisma.investorCashflow.deleteMany();
      await prisma.investor.deleteMany();
      await prisma.user.deleteMany();

      // Create test users and investors for performance fee tests
      const testUser1 = await prisma.user.create({
        data: {
          name: 'Test User A',
          email: 'testusera@test.com',
          password: 'test123',
          role: 'INVESTOR',
        },
      });

      const testUser2 = await prisma.user.create({
        data: {
          name: 'Test User B',
          email: 'testuserb@test.com',
          password: 'test123',
          role: 'INVESTOR',
        },
      });

      const testInvestor1 = await prisma.investor.create({
        data: { userId: testUser1.id, name: 'Test Investor A', email: 'a@test.com' },
      });

      const testInvestor2 = await prisma.investor.create({
        data: { userId: testUser2.id, name: 'Test Investor B', email: 'b@test.com' },
      });

      // Restore some test data
      await prisma.investorCashflow.createMany({
        data: [
          {
            investorId: testInvestor1.id,
            type: 'DEPOSIT',
            amount: 100000,
            date: new Date(),
          },
          {
            investorId: testInvestor2.id,
            type: 'DEPOSIT',
            amount: 50000,
            date: new Date(),
          },
        ],
      });
    });

    afterAll(async () => {
      // Clean up all data created by performance fee tests
      await prisma.assetEvent.deleteMany();
      await prisma.asset.deleteMany();
      await prisma.bankBalance.deleteMany();
      await prisma.liability.deleteMany();
    });

    it('should calculate performance fee at 2% rate', async () => {
      // Create assets and bank balances for positive NAV
      await prisma.asset.createMany({
        data: [
          { name: 'Test Asset 1', type: 'real_estate', currentValue: 100000 },
          { name: 'Test Asset 2', type: 'stock', currentValue: 50000 },
        ],
      });

      await prisma.bankBalance.create({
        data: {
          accountName: 'Test Account',
          amount: 40000,
          currency: 'EUR',
          date: new Date(),
        },
      });

      const nav = await snapshotsService.calculateCurrentNav();
      const performanceFeeRate = 2.0; // 2%
      const expectedFee = nav.nav * (performanceFeeRate / 100); // Should be 190000 * 0.02 = 3800

      const snapshot = await snapshotsService.createSnapshot({
        date: new Date(),
        performanceFeeRate,
      });

      expect(snapshot.performanceFeeRate).toBe(performanceFeeRate);
      expect(snapshot.totalPerformanceFee).toBeCloseTo(expectedFee, 2);

      // Check that performance fee is allocated to investors based on ownership
      const investorA = snapshot.investorSnapshots?.find(is => is.investor.email === 'a@test.com');
      const investorB = snapshot.investorSnapshots?.find(is => is.investor.email === 'b@test.com');

      // Investor A has 66.67% ownership (100k out of 150k), Investor B has 33.33%
      expect(investorA?.performanceFee).toBeCloseTo(expectedFee * (2 / 3), 1);
      expect(investorB?.performanceFee).toBeCloseTo(expectedFee * (1 / 3), 1);
    });

    it('should handle zero performance fee rate', async () => {
      const snapshot = await snapshotsService.createSnapshot({
        date: new Date(),
        performanceFeeRate: 0,
      });

      expect(snapshot.performanceFeeRate).toBe(0);
      expect(snapshot.totalPerformanceFee).toBe(null);

      // All investor performance fees should be null or 0
      snapshot.investorSnapshots?.forEach(is => {
        expect(is.performanceFee).toBeNull();
      });
    });

    it('should handle undefined performance fee rate', async () => {
      const snapshot = await snapshotsService.createSnapshot({
        date: new Date(),
      });

      expect(snapshot.performanceFeeRate).toBeNull();
      expect(snapshot.totalPerformanceFee).toBeNull();

      // All investor performance fees should be null
      snapshot.investorSnapshots?.forEach(is => {
        expect(is.performanceFee).toBeNull();
      });
    });

    it('should calculate performance fee with high rate', async () => {
      // Create assets for positive NAV
      await prisma.asset.createMany({
        data: [{ name: 'High Rate Asset', type: 'real_estate', currentValue: 100000 }],
      });

      const performanceFeeRate = 20.0; // 20%

      const snapshot = await snapshotsService.createSnapshot({
        date: new Date(),
        performanceFeeRate,
      });

      expect(snapshot.performanceFeeRate).toBe(performanceFeeRate);
      expect(snapshot.totalPerformanceFee).toBeGreaterThan(0);

      // Total allocated performance fees should equal total performance fee
      const totalAllocatedFees =
        snapshot.investorSnapshots?.reduce((sum, is) => sum + (is.performanceFee || 0), 0) || 0;

      expect(totalAllocatedFees).toBeCloseTo(snapshot.totalPerformanceFee || 0, 1);
    });
  });

  describe('Asset Breakdown by Type', () => {
    it('should group assets correctly by type', async () => {
      // Clean existing assets
      await prisma.asset.deleteMany();

      // Create diverse asset portfolio
      await prisma.asset.createMany({
        data: [
          { name: 'Property 1', type: 'real_estate', currentValue: 200000 },
          { name: 'Property 2', type: 'real_estate', currentValue: 150000 },
          { name: 'AAPL Stock', type: 'stock', currentValue: 50000 },
          { name: 'TSLA Stock', type: 'stock', currentValue: 30000 },
          { name: 'Business Loan 1', type: 'loan', currentValue: 75000 },
          { name: 'Vehicle Fleet', type: 'vehicle', currentValue: 40000 },
        ],
      });

      const nav = await snapshotsService.calculateCurrentNav();

      expect(nav.assetBreakdown).toHaveLength(4); // 4 different types

      const realEstate = nav.assetBreakdown.find(a => a.type === 'real_estate');
      expect(realEstate?.count).toBe(2);
      expect(realEstate?.totalValue).toBe(350000);

      const stocks = nav.assetBreakdown.find(a => a.type === 'stock');
      expect(stocks?.count).toBe(2);
      expect(stocks?.totalValue).toBe(80000);

      const loans = nav.assetBreakdown.find(a => a.type === 'loan');
      expect(loans?.count).toBe(1);
      expect(loans?.totalValue).toBe(75000);

      const vehicles = nav.assetBreakdown.find(a => a.type === 'vehicle');
      expect(vehicles?.count).toBe(1);
      expect(vehicles?.totalValue).toBe(40000);

      // Total should match sum of all asset values
      const totalFromBreakdown = nav.assetBreakdown.reduce((sum, a) => sum + a.totalValue, 0);
      expect(totalFromBreakdown).toBe(nav.totalAssetValue);
    });
  });

  describe('Bank Breakdown by Currency', () => {
    it('should group bank balances by currency', async () => {
      // Clean existing bank balances
      await prisma.bankBalance.deleteMany();

      // Create multi-currency balances
      await prisma.bankBalance.createMany({
        data: [
          {
            accountName: 'EUR Business',
            amount: 100000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'EUR Savings',
            amount: 50000,
            currency: 'EUR',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'USD Account',
            amount: 75000,
            currency: 'USD',
            date: new Date('2025-01-15'),
          },
          {
            accountName: 'GBP Account',
            amount: 25000,
            currency: 'GBP',
            date: new Date('2025-01-15'),
          },
        ],
      });

      const nav = await snapshotsService.calculateCurrentNav();

      expect(nav.bankBreakdown).toHaveLength(3); // 3 different currencies

      const eurBreakdown = nav.bankBreakdown.find(b => b.currency === 'EUR');
      expect(eurBreakdown?.totalAmount).toBe(150000);

      const usdBreakdown = nav.bankBreakdown.find(b => b.currency === 'USD');
      expect(usdBreakdown?.totalAmount).toBe(75000);

      const gbpBreakdown = nav.bankBreakdown.find(b => b.currency === 'GBP');
      expect(gbpBreakdown?.totalAmount).toBe(25000);

      // Total should match sum of all bank balances
      const totalFromBreakdown = nav.bankBreakdown.reduce((sum, b) => sum + b.totalAmount, 0);
      expect(totalFromBreakdown).toBe(nav.totalBankBalance);
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { prisma } from '../core/prisma.js';

describe('Integration Tests - Key Application Flows', () => {
  let authToken: string;
  let testUserId: string;
  let investor1Id: string;
  let investor2Id: string;
  let assetId: string;

  beforeAll(async () => {
    // Clean up all test data
    await prisma.investorSnapshot.deleteMany();
    await prisma.periodSnapshot.deleteMany();
    await prisma.assetEvent.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.bankBalance.deleteMany();
    await prisma.liability.deleteMany();
    await prisma.investorCashflow.deleteMany();
    await prisma.investor.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { contains: 'integration-test' } },
    });

    // Create test user and get auth token
    const registerResponse = await request(app).post('/api/auth/register').send({
      email: 'integration-test@example.com',
      password: 'testpass123',
      name: 'Integration Test User',
      role: 'ADMIN',
    });

    authToken = registerResponse.body.accessToken;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.investorSnapshot.deleteMany();
    await prisma.periodSnapshot.deleteMany();
    await prisma.assetEvent.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.bankBalance.deleteMany();
    await prisma.liability.deleteMany();
    await prisma.investorCashflow.deleteMany();
    await prisma.investor.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { contains: 'integration-test' } },
    });
    await prisma.$disconnect();
  });

  describe('Flow 1: Investor Deposit → Snapshot → Ownership % Change', () => {
    it('should create investors, add deposits, and verify ownership changes in snapshots', async () => {
      // Step 1: Create two investors
      const investor1Response = await request(app)
        .post('/api/investors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          name: 'Investor Alpha',
          email: 'alpha@test.com',
        })
        .expect(201);

      // Create another user for second investor
      const user2Response = await request(app).post('/api/auth/register').send({
        email: 'integration-test2@example.com',
        password: 'testpass123',
        name: 'Integration Test User 2',
        role: 'INVESTOR',
      });

      const investor2Response = await request(app)
        .post('/api/investors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: user2Response.body.user.id,
          name: 'Investor Beta',
          email: 'beta@test.com',
        })
        .expect(201);

      investor1Id = investor1Response.body.id;
      investor2Id = investor2Response.body.id;

      // Step 2: Add equal initial deposits
      await request(app)
        .post(`/api/investors/${investor1Id}/cashflows`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'DEPOSIT',
          amount: 100000,
          date: new Date().toISOString(),
          note: 'Initial investment',
        })
        .expect(201);

      await request(app)
        .post(`/api/investors/${investor2Id}/cashflows`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'DEPOSIT',
          amount: 100000,
          date: new Date().toISOString(),
          note: 'Initial investment',
        })
        .expect(201);

      // Step 3: Create initial snapshot
      const initialSnapshotResponse = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
        })
        .expect(201);

      // Verify equal ownership (50% each)
      const initialSnapshot = initialSnapshotResponse.body;
      expect(initialSnapshot.investorSnapshots).toHaveLength(2);

      const alpha1 = initialSnapshot.investorSnapshots.find(
        (is: any) => is.investorId === investor1Id
      );
      const beta1 = initialSnapshot.investorSnapshots.find(
        (is: any) => is.investorId === investor2Id
      );

      expect(alpha1.ownershipPercent).toBe(50);
      expect(beta1.ownershipPercent).toBe(50);
      expect(alpha1.capitalAmount).toBe(100000);
      expect(beta1.capitalAmount).toBe(100000);

      // Step 4: Investor Alpha adds additional deposit
      await request(app)
        .post(`/api/investors/${investor1Id}/cashflows`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'DEPOSIT',
          amount: 200000, // Additional 200k
          date: new Date().toISOString(),
          note: 'Additional investment',
        })
        .expect(201);

      // Step 5: Create second snapshot
      const secondSnapshotResponse = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
        })
        .expect(201);

      // Verify changed ownership percentages
      const secondSnapshot = secondSnapshotResponse.body;
      const alpha2 = secondSnapshot.investorSnapshots.find(
        (is: any) => is.investorId === investor1Id
      );
      const beta2 = secondSnapshot.investorSnapshots.find(
        (is: any) => is.investorId === investor2Id
      );

      // Alpha: 300k out of 400k total = 75%
      // Beta: 100k out of 400k total = 25%
      expect(alpha2.ownershipPercent).toBe(75);
      expect(beta2.ownershipPercent).toBe(25);
      expect(alpha2.capitalAmount).toBe(300000);
      expect(beta2.capitalAmount).toBe(100000);

      // Verify total ownership is always 100%
      const totalOwnership1 = alpha1.ownershipPercent + beta1.ownershipPercent;
      const totalOwnership2 = alpha2.ownershipPercent + beta2.ownershipPercent;
      expect(totalOwnership1).toBe(100);
      expect(totalOwnership2).toBe(100);
    });
  });

  describe('Flow 2: Asset Valuation + CAPEX → NAV Change', () => {
    it('should create asset, add events, and verify NAV changes correctly', async () => {
      // Step 1: Create an asset
      const assetResponse = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Real Estate',
          type: 'real_estate',
          acquiredPrice: 500000,
          currentValue: 500000,
        })
        .expect(201);

      assetId = assetResponse.body.id;

      // Step 2: Get initial NAV
      const initialNavResponse = await request(app)
        .get('/api/snapshots/nav/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const initialNav = initialNavResponse.body.nav;
      expect(initialNavResponse.body.totalAssetValue).toBe(500000);

      // Step 3: Add CAPEX (should increase current value)
      await request(app)
        .post(`/api/assets/${assetId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'CAPEX',
          amount: 50000,
          date: new Date().toISOString(),
          note: 'Renovation investment',
        })
        .expect(201);

      // Verify asset current value increased by CAPEX
      const assetAfterCapex = await request(app)
        .get(`/api/assets/${assetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(assetAfterCapex.body.currentValue).toBe(550000); // 500000 + 50000

      // Step 4: Add VALUATION (should set new current value)
      await request(app)
        .post(`/api/assets/${assetId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'VALUATION',
          amount: 580000,
          date: new Date().toISOString(),
          note: 'Professional valuation after renovation',
        })
        .expect(201);

      // Verify asset current value is now the valuation amount
      const assetAfterValuation = await request(app)
        .get(`/api/assets/${assetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(assetAfterValuation.body.currentValue).toBe(580000);

      // Step 5: Get final NAV and verify change
      const finalNavResponse = await request(app)
        .get('/api/snapshots/nav/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const finalNav = finalNavResponse.body.nav;
      const navChange = finalNav - initialNav;

      // NAV should have increased by 80k (580k - 500k), not by 130k (50k + 80k)
      expect(navChange).toBe(80000);
      expect(finalNavResponse.body.totalAssetValue).toBe(580000);

      // Step 6: Create snapshot to capture the changes
      const snapshotResponse = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
        })
        .expect(201);

      expect(snapshotResponse.body.totalAssetValue).toBe(580000);
      expect(snapshotResponse.body.nav).toBe(finalNav);
    });
  });

  describe('Flow 3: Asset Sale → Reports → PnL Calculation', () => {
    it('should mark asset as sold and verify it appears in reports with correct PnL', async () => {
      // Step 0: Create asset for this test (if not exists from previous test)
      let testAssetId = assetId;
      if (!testAssetId) {
        const assetResponse = await request(app)
          .post('/api/assets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Real Estate',
            type: 'real_estate',
            currentValue: 500000,
            acquiredPrice: 500000,
          })
          .expect(201);
        testAssetId = assetResponse.body.id;
      }

      // Step 1: Mark the asset as sold
      const saleResponse = await request(app)
        .post(`/api/assets/${testAssetId}/mark-sold`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          salePrice: 620000,
          date: new Date().toISOString(),
          note: 'Sold to investor',
        })
        .expect(200);

      expect(saleResponse.body.status).toBe('SOLD');
      expect(saleResponse.body.salePrice).toBe(620000);

      // Step 2: Verify asset is marked as sold
      const soldAsset = await request(app)
        .get(`/api/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(soldAsset.body.status).toBe('SOLD');
      expect(soldAsset.body.salePrice).toBe(620000);

      // Step 3: Get portfolio report and verify sold asset appears
      const portfolioReportResponse = await request(app)
        .get('/api/reports/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const soldAssets = portfolioReportResponse.body.soldAssets;
      expect(soldAssets).toHaveLength(1);

      const soldAssetReport = soldAssets[0];
      expect(soldAssetReport.id).toBe(testAssetId);
      expect(soldAssetReport.acquiredPrice).toBe(500000);
      expect(soldAssetReport.salePrice).toBe(620000);

      // PnL should be 120k (620k sale - 500k acquired)
      expect(soldAssetReport.pnl).toBe(120000);
      expect(soldAssetReport.pnlPercent).toBeCloseTo(24, 1); // 24% return

      // Step 4: Verify performance report includes the PnL
      const performanceReportResponse = await request(app)
        .get('/api/reports/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const performanceReport = performanceReportResponse.body;
      expect(performanceReport.totalRealizedPnL).toBe(120000);
      expect(performanceReport.soldAssetsCount).toBe(1);

      // Step 5: Create final snapshot after sale
      const finalSnapshotResponse = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
        })
        .expect(201);

      // NAV should no longer include the sold asset
      expect(finalSnapshotResponse.body.totalAssetValue).toBe(0);

      // But if we had bank balance from the sale, it would show up in bank balance
      // (This would require implementing the sale proceeds logic)
    });
  });

  describe('Flow 4: CSV Bank Import → NAV Integration', () => {
    it('should import bank balances from CSV and verify NAV calculation', async () => {
      // Step 1: Prepare CSV data
      const csvContent =
        'Business Account,2025-01-15,250000\nSavings Account,2025-01-15,100000\nUSD Account,2025-01-15,75000';
      const base64Content = Buffer.from(csvContent).toString('base64');

      // Step 2: Import CSV
      const importResponse = await request(app)
        .post('/api/bank/import/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          file: base64Content,
          delimiter: ',',
          skipFirstRow: false,
          mapping: {
            accountName: 0,
            date: 1,
            amount: 2,
          },
        })
        .expect(200);

      expect(importResponse.body.totalRows).toBe(3);
      expect(importResponse.body.successfulRows).toBe(3);
      expect(importResponse.body.failedRows).toBe(0);
      expect(importResponse.body.importedBalances).toHaveLength(3);

      // Step 3: Verify bank balances were created
      const bankBalancesResponse = await request(app)
        .get('/api/bank/balances')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(bankBalancesResponse.body.balances).toHaveLength(3);
      expect(bankBalancesResponse.body.summary.totalAmount).toBe(425000);

      // Step 4: Verify NAV includes bank balances
      const navResponse = await request(app)
        .get('/api/snapshots/nav/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(navResponse.body.totalBankBalance).toBe(425000);
      expect(navResponse.body.nav).toBe(425000); // No assets or liabilities now
      expect(navResponse.body.bankBreakdown).toHaveLength(1); // All EUR by default

      // Step 5: Add liability and verify NAV calculation
      await request(app)
        .post('/api/liabilities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Business Loan',
          currentBalance: 150000,
          note: 'Equipment financing',
        })
        .expect(201);

      // Step 6: Verify final NAV calculation
      const finalNavResponse = await request(app)
        .get('/api/snapshots/nav/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalNavResponse.body.totalBankBalance).toBe(425000);
      expect(finalNavResponse.body.totalLiabilities).toBe(150000);
      expect(finalNavResponse.body.nav).toBe(275000); // 425000 - 150000

      // Step 7: Create snapshot to capture everything
      const snapshotResponse = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
          performanceFeeRate: 2.5,
        })
        .expect(201);

      expect(snapshotResponse.body.nav).toBe(275000);
      expect(snapshotResponse.body.totalBankBalance).toBe(425000);
      expect(snapshotResponse.body.totalLiabilities).toBe(150000);
      expect(snapshotResponse.body.performanceFeeRate).toBe(2.5);
      expect(snapshotResponse.body.totalPerformanceFee).toBe(6875); // 2.5% of 275000
    });
  });

  describe('Flow 5: Complete Investment Lifecycle', () => {
    it('should simulate complete investment lifecycle with multiple investors', async () => {
      // Clean slate for this comprehensive test
      await prisma.investorSnapshot.deleteMany();
      await prisma.periodSnapshot.deleteMany();
      await prisma.assetEvent.deleteMany();
      await prisma.asset.deleteMany();
      await prisma.bankBalance.deleteMany();
      await prisma.liability.deleteMany();
      await prisma.investorCashflow.deleteMany();
      await prisma.investor.deleteMany();

      // Step 1: Create multiple assets
      const asset1Response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Commercial Property',
          type: 'real_estate',
          acquiredPrice: 1000000,
          currentValue: 1000000,
        })
        .expect(201);

      const asset2Response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Stock Portfolio',
          type: 'stock',
          acquiredPrice: 500000,
          currentValue: 500000,
        })
        .expect(201);

      // Asset created successfully
      const asset2Id = asset2Response.body.id;

      // Step 2: Add bank balances
      await request(app)
        .post('/api/bank/balances')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountName: 'Operating Account',
          amount: 200000,
          currency: 'EUR',
          date: new Date().toISOString(),
        })
        .expect(201);

      // Step 3: Add liabilities
      await request(app)
        .post('/api/liabilities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Property Mortgage',
          currentBalance: 600000,
        })
        .expect(201);

      // Step 3.5: Create users and investors for ownership tracking
      const alphaUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alpha User',
          email: `alpha-${Date.now()}@lifecycle.com`,
          password: 'password123',
          role: 'INVESTOR',
        })
        .expect(201);

      const betaUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Beta User',
          email: `beta-${Date.now()}@lifecycle.com`,
          password: 'password123',
          role: 'INVESTOR',
        })
        .expect(201);

      const investor1Response = await request(app)
        .post('/api/investors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: alphaUserResponse.body.user.id,
          name: 'Alpha Investor',
          email: alphaUserResponse.body.user.email,
        })
        .expect(201);

      const investor2Response = await request(app)
        .post('/api/investors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: betaUserResponse.body.user.id,
          name: 'Beta Investor',
          email: betaUserResponse.body.user.email,
        })
        .expect(201);

      const investor1Id = investor1Response.body.id;
      const investor2Id = investor2Response.body.id;

      // Add investor deposits to establish ownership
      await request(app)
        .post('/api/investors/cashflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          investorId: investor1Id,
          type: 'DEPOSIT',
          amount: 300000, // 75% of total 400k
          date: new Date().toISOString(),
        })
        .expect(201);

      await request(app)
        .post('/api/investors/cashflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          investorId: investor2Id,
          type: 'DEPOSIT',
          amount: 100000, // 25% of total 400k
          date: new Date().toISOString(),
        })
        .expect(201);

      // Step 4: Create initial snapshot
      const initialSnapshot = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
          performanceFeeRate: 2.0,
        })
        .expect(201);

      // Initial NAV: 1,000,000 + 500,000 + 200,000 - 600,000 = 1,100,000
      expect(initialSnapshot.body.nav).toBe(1100000);
      expect(initialSnapshot.body.totalPerformanceFee).toBe(22000); // 2% of 1,100,000

      // Step 5: Simulate asset appreciation
      await request(app)
        .post(`/api/assets/${asset1Response.body.id}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'VALUATION',
          amount: 1200000, // 20% appreciation
          date: new Date().toISOString(),
          note: 'Market valuation increase',
        })
        .expect(201);

      await request(app)
        .post(`/api/assets/${asset2Response.body.id}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'VALUATION',
          amount: 550000, // 10% appreciation
          date: new Date().toISOString(),
          note: 'Stock portfolio growth',
        })
        .expect(201);

      // Step 6: Create second snapshot
      const secondSnapshot = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
          performanceFeeRate: 2.0,
        })
        .expect(201);

      // New NAV: 1,200,000 + 550,000 + 200,000 - 600,000 = 1,350,000
      expect(secondSnapshot.body.nav).toBe(1350000);
      expect(secondSnapshot.body.totalPerformanceFee).toBe(27000); // 2% of 1,350,000

      // Step 7: Verify investor ownership remains consistent
      const alpha = secondSnapshot.body.investorSnapshots.find(
        (is: any) => is.investorId === investor1Id
      );
      const beta = secondSnapshot.body.investorSnapshots.find(
        (is: any) => is.investorId === investor2Id
      );

      // Ownership should still be 75% / 25% from earlier test
      expect(alpha.ownershipPercent).toBe(75);
      expect(beta.ownershipPercent).toBe(25);

      // Performance fees should be allocated proportionally
      expect(alpha.performanceFee).toBe(20250); // 75% of 27,000
      expect(beta.performanceFee).toBe(6750); // 25% of 27,000

      // Step 7.5: Sell one asset to generate realized PnL
      await request(app)
        .post(`/api/assets/${asset2Id}/mark-sold`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          salePrice: 620000, // Asset acquired at 500k, so 120k profit
          date: new Date().toISOString(),
          note: 'Asset sale for lifecycle test',
        })
        .expect(200);

      // Step 8: Generate comprehensive reports
      const portfolioReport = await request(app)
        .get('/api/reports/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(portfolioReport.body.totalAssetValue).toBe(1200000); // Only asset1 remains active
      expect(portfolioReport.body.activeAssets).toHaveLength(1);
      expect(portfolioReport.body.soldAssets).toHaveLength(1);

      const investorReport = await request(app)
        .get('/api/reports/investors')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(investorReport.body.totalInvestors).toBe(2);
      expect(investorReport.body.totalCapital).toBe(400000);

      const performanceReport = await request(app)
        .get('/api/reports/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(performanceReport.body.totalUnrealizedPnL).toBe(200000); // 1200k - 1000k (only asset1 active now)
      expect(performanceReport.body.totalRealizedPnL).toBe(120000); // 620k - 500k from asset2 sale

      // Step 9: Verify all snapshots are retrievable
      const snapshotsResponse = await request(app)
        .get('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(snapshotsResponse.body.snapshots.length).toBeGreaterThanOrEqual(2);
      expect(snapshotsResponse.body.pagination.total).toBeGreaterThanOrEqual(2);
    });
  });
});

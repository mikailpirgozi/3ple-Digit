import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import { prisma } from '../../core/prisma.js';

describe('Snapshots API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.investorSnapshot.deleteMany();
    await prisma.periodSnapshot.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.bankBalance.deleteMany();
    await prisma.liability.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { contains: 'snapshot-test' } }
    });

    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'snapshot-test@example.com',
        password: 'testpass123',
        name: 'Snapshot Test User',
        role: 'ADMIN'
      });
    
    authToken = registerResponse.body.accessToken;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.investorSnapshot.deleteMany();
    await prisma.periodSnapshot.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.bankBalance.deleteMany();
    await prisma.liability.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { contains: 'snapshot-test' } }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/snapshots/nav/current', () => {
    it('should calculate NAV with no data', async () => {
      const response = await request(app)
        .get('/api/snapshots/nav/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalAssetValue', 0);
      expect(response.body).toHaveProperty('totalBankBalance', 0);
      expect(response.body).toHaveProperty('totalLiabilities', 0);
      expect(response.body).toHaveProperty('nav', 0);
      expect(response.body).toHaveProperty('assetBreakdown');
      expect(response.body).toHaveProperty('bankBreakdown');
      expect(response.body).toHaveProperty('liabilityBreakdown');
    });

    it('should calculate NAV with test data', async () => {
      // Create test asset
      await prisma.asset.create({
        data: {
          name: 'Test Asset',
          type: 'real_estate',
          currentValue: 100000,
        }
      });

      // Create test bank balance
      await prisma.bankBalance.create({
        data: {
          accountName: 'Test Account',
          amount: 50000,
          currency: 'EUR',
          date: new Date(),
        }
      });

      // Create test liability
      await prisma.liability.create({
        data: {
          name: 'Test Liability',
          currentBalance: 30000,
        }
      });

      const response = await request(app)
        .get('/api/snapshots/nav/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalAssetValue).toBe(100000);
      expect(response.body.totalBankBalance).toBe(50000);
      expect(response.body.totalLiabilities).toBe(30000);
      expect(response.body.nav).toBe(120000); // 100000 + 50000 - 30000
      expect(response.body.assetBreakdown).toHaveLength(1);
      expect(response.body.assetBreakdown[0].type).toBe('real_estate');
      expect(response.body.assetBreakdown[0].totalValue).toBe(100000);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/snapshots/nav/current')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/snapshots', () => {
    it('should create snapshot with current NAV', async () => {
      const snapshotData = {
        date: new Date().toISOString(),
        performanceFeeRate: 2.5,
      };

      const response = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${authToken}`)
        .send(snapshotData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nav');
      expect(response.body).toHaveProperty('totalAssetValue');
      expect(response.body).toHaveProperty('totalBankBalance');
      expect(response.body).toHaveProperty('totalLiabilities');
      expect(response.body).toHaveProperty('performanceFeeRate', 2.5);
      expect(response.body).toHaveProperty('totalPerformanceFee');
      expect(response.body.totalPerformanceFee).toBeGreaterThan(0);
    });

    it('should require admin/internal role', async () => {
      // Create investor user
      const investorResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'investor-test@example.com',
          password: 'testpass123',
          name: 'Investor User',
          role: 'INVESTOR'
        });

      const response = await request(app)
        .post('/api/snapshots')
        .set('Authorization', `Bearer ${investorResponse.body.accessToken}`)
        .send({
          date: new Date().toISOString(),
        })
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/snapshots', () => {
    it('should return paginated snapshots', async () => {
      const response = await request(app)
        .get('/api/snapshots?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('snapshots');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.snapshots)).toBe(true);
    });
  });
});

import { beforeAll, afterAll } from 'vitest';

// Set test environment variables before importing prisma
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';

import { prisma } from './core/prisma.js';

beforeAll(async () => {
  // Test setup - silent in production
});

// Note: Individual test files should handle their own cleanup
// Global cleanup is only done at the end

afterAll(async () => {
  // Final cleanup
  await cleanDatabase();
  await prisma.$disconnect();
  // Tests cleanup completed - silent in production
});

async function cleanDatabase() {
  // Delete in correct order to avoid foreign key constraints
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.investorSnapshot.deleteMany();
  await prisma.periodSnapshot.deleteMany();
  await prisma.bankBalance.deleteMany();
  await prisma.liability.deleteMany();
  await prisma.assetEvent.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.investorCashflow.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.user.deleteMany();
}

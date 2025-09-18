import { afterAll, beforeAll } from 'vitest';

// CRITICAL SAFETY: FORCE test environment and database
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// 🚨 ULTIMATE PROTECTION: NEVER use production database in tests
// FORCE override any existing DATABASE_URL to use test database
const originalDatabaseUrl = process.env.DATABASE_URL;
if (originalDatabaseUrl?.includes('railway.app') ?? originalDatabaseUrl?.includes('rlwy.net')) {
  console.error('🚨 CRITICAL: Production DATABASE_URL detected in tests!');
  console.error('Original URL:', originalDatabaseUrl);
  console.error('FORCING test database to prevent data loss...');
}
process.env.DATABASE_URL = 'file:./test.db'; // FORCE test database

import { prisma, reinitializePrismaClient } from './core/prisma.js';

beforeAll(async () => {
  // Test setup - reinitialize Prisma client with SQLite URL
  // eslint-disable-next-line no-console
  console.log('🧪 Test environment initialized with SQLite');
  // eslint-disable-next-line no-console
  console.log('🔄 Reinitializing Prisma client for SQLite...');

  // Reinitialize Prisma client to use the new DATABASE_URL
  reinitializePrismaClient();

  // eslint-disable-next-line no-console
  console.log('✅ Prisma client reinitialized for SQLite');
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
  // CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
  const isProduction = process.env.NODE_ENV === 'production';
  const isRailwayEnv = process.env.RAILWAY_ENVIRONMENT === 'production';
  const hasProductionUrl =
    process.env.DATABASE_URL?.includes('railway.app') ??
    process.env.DATABASE_URL?.includes('rlwy.net');

  if (isProduction || isRailwayEnv || hasProductionUrl) {
    console.error('🚨 TEST CLEANUP BLOCKED: Cannot clean production database!');
    throw new Error('PRODUCTION TEST CLEANUP BLOCKED');
  }

  // Delete in correct order to avoid foreign key constraints (ONLY on test database)
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

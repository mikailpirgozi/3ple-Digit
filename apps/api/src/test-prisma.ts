// Test-specific Prisma client for SQLite
// This ensures tests use SQLite instead of PostgreSQL

import { PrismaClient } from '@prisma/client';

// Create test Prisma client instance with SQLite configuration
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

// Export all Prisma types for tests
export * from '@prisma/client';

#!/usr/bin/env node

// Setup SQLite test database for tests
// This script ensures SQLite database exists with proper schema

import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';

const testDbPath = './test.db';

try {
  console.log('🔧 Setting up SQLite test database...');

  // Remove existing test database
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
    console.log('🗑️ Removed existing test database');
  }

  // Set environment for SQLite
  const env = {
    ...process.env,
    DATABASE_URL: 'file:./test.db',
    NODE_ENV: 'test',
  };

  // Generate Prisma client for SQLite using test schema
  console.log('🔧 Generating Prisma client for SQLite...');
  execSync('npx prisma generate --schema=prisma/schema.test.prisma', { env, stdio: 'pipe' });

  // Set environment variable for tests to use test schema
  process.env.PRISMA_SCHEMA_PATH = 'prisma/schema.test.prisma';

  // Create SQLite database with schema
  console.log('🏗️ Creating database schema...');
  execSync(
    'npx prisma db push --force-reset --accept-data-loss --schema=prisma/schema.test.prisma',
    { env, stdio: 'pipe' }
  );

  console.log('✅ SQLite test database ready!');
} catch (error) {
  console.error('❌ Failed to setup test database:', error.message);
  process.exit(1);
}

// Cleanup function - no longer needed since we don't modify main schema
process.on('exit', () => {
  // No cleanup needed - main schema is never modified
});

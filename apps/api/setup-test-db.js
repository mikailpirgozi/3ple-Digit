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

  // Use test schema for SQLite
  console.log('📋 Copying SQLite schema...');
  execSync('cp prisma/schema.test.prisma prisma/schema.prisma.temp', { env });

  // Copy SQLite schema to main schema for client generation
  console.log('⚙️ Preparing schema...');
  execSync('cp prisma/schema.test.prisma prisma/schema.prisma', { env });

  // Generate Prisma client for SQLite
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { env, stdio: 'pipe' });

  // Create SQLite database with schema
  console.log('🏗️ Creating database schema...');
  execSync('npx prisma db push --force-reset --accept-data-loss', { env, stdio: 'pipe' });

  console.log('✅ SQLite test database ready!');
} catch (error) {
  console.error('❌ Failed to setup test database:', error.message);
  process.exit(1);
}

// Cleanup function to restore original schema after tests
process.on('exit', () => {
  try {
    if (existsSync('prisma/schema.prisma.temp')) {
      execSync('mv prisma/schema.prisma.temp prisma/schema.prisma');
      execSync('npx prisma generate', { stdio: 'pipe' });
    }
  } catch (error) {
    // Silent cleanup failure
  }
});

#!/usr/bin/env node

/**
 * SAFE PRISMA MIGRATION SCRIPT
 * Prevents accidental destructive migrations on production
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// Load .env file manually
function loadEnv() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    // .env file not found, continue
  }
}

function checkProductionSafety() {
  loadEnv(); // Load environment variables
  const databaseUrl = process.env.DATABASE_URL;

  // Check if we're targeting production database
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.RAILWAY_ENVIRONMENT === 'production' ||
    databaseUrl?.includes('railway.app') ||
    databaseUrl?.includes('rlwy.net') ||
    databaseUrl?.includes('railway') ||
    databaseUrl?.startsWith('postgresql://');

  if (isProduction) {
    console.log('🚨 PRODUCTION DATABASE DETECTED!');
    console.log('Database URL:', databaseUrl?.replace(/:[^:@]*@/, ':***@')); // Hide password
    console.log('');
    console.log('⚠️  SAFETY RULES FOR PRODUCTION:');
    console.log('1. Use "prisma migrate deploy" (not "prisma migrate dev")');
    console.log('2. Never use "prisma migrate reset"');
    console.log('3. Always backup before migrations');
    console.log('4. Test migrations on staging first');
    console.log('');

    const command = process.argv.slice(2).join(' ');

    // Block dangerous commands
    if (command.includes('migrate dev') || command.includes('migrate reset')) {
      console.error('❌ BLOCKED: Dangerous migration command on production!');
      console.error('Use "prisma migrate deploy" instead');
      process.exit(1);
    }

    // Warn about deploy
    if (command.includes('migrate deploy')) {
      console.log('✅ Using safe "migrate deploy" command');
      console.log('⚠️  Make sure you have a backup!');
    }
  }

  return isProduction;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node prisma-safe-migrate.js <prisma-command>');
    console.log('Example: node prisma-safe-migrate.js migrate deploy');
    process.exit(1);
  }

  checkProductionSafety();

  const command = `npx prisma ${args.join(' ')}`;
  console.log(`Executing: ${command}`);

  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

main();

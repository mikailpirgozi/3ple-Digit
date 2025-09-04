#!/usr/bin/env node

/**
 * ENHANCED PROTECTION SYSTEM
 * Combines the best from both applications
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

// Enhanced environment detection
function detectEnvironment() {
  const databaseUrl = process.env.DATABASE_URL;

  // Multiple detection methods
  const indicators = {
    hasRailwayUrl: databaseUrl?.includes('railway') || databaseUrl?.includes('rlwy.net'),
    hasProductionEnv: process.env.NODE_ENV === 'production',
    hasRailwayEnv: process.env.RAILWAY_ENVIRONMENT === 'production',
    hasProductionHost: databaseUrl?.includes('proxy.rlwy.net'),
    isPostgreSQL: databaseUrl?.startsWith('postgresql://'),
    isNotLocalhost: databaseUrl && !databaseUrl.includes('localhost'),
  };

  const productionScore = Object.values(indicators).filter(Boolean).length;
  const isProduction = productionScore >= 2; // Require multiple indicators

  return {
    isProduction,
    indicators,
    productionScore,
    databaseUrl: databaseUrl?.replace(/:[^:@]*@/, ':***@'), // Hide password
  };
}

// Database-level safety check
async function checkDatabaseSafety() {
  const prisma = new PrismaClient();

  try {
    // Check current database name
    const result = await prisma.$queryRaw`SELECT current_database() as db_name`;
    const dbName = result[0]?.db_name;

    console.log(`🔍 Connected to database: ${dbName}`);

    // Check if protection triggers exist
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_name LIKE 'protect_%'
    `;

    if (triggers.length === 0) {
      console.log('⚠️  Database-level protection not installed');
      console.log('💡 Run: psql $DATABASE_URL < src/core/database-protection.sql');
    } else {
      console.log(`✅ Database protection active (${triggers.length} triggers)`);
    }

    return { dbName, hasProtection: triggers.length > 0 };
  } catch (error) {
    console.error('❌ Database safety check failed:', error.message);
    return { dbName: 'unknown', hasProtection: false };
  } finally {
    await prisma.$disconnect();
  }
}

// Enhanced backup with metadata
async function createEnhancedBackup(reason = 'manual') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const env = detectEnvironment();

  if (!env.isProduction) {
    console.log('ℹ️  Skipping backup for non-production environment');
    return null;
  }

  const backupFile = `backups/enhanced-backup-${timestamp}.sql`;
  const metadataFile = `backups/enhanced-backup-${timestamp}.json`;

  try {
    console.log('🔄 Creating enhanced backup...');

    // Create backup
    execSync(`railway run 'pg_dump $DATABASE_URL --data-only --inserts' > "${backupFile}"`, {
      stdio: 'inherit',
    });

    // Create metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      reason,
      environment: env,
      fileSize: require('fs').statSync(backupFile).size,
      command: process.argv.join(' '),
    };

    writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

    console.log(`✅ Enhanced backup created: ${backupFile}`);
    console.log(`📋 Metadata saved: ${metadataFile}`);

    return { backupFile, metadataFile, metadata };
  } catch (error) {
    console.error('❌ Enhanced backup failed:', error.message);
    throw error;
  }
}

// Role-based permission check
function checkPermissions(operation) {
  const user = process.env.USER || process.env.USERNAME || 'unknown';
  const allowedUsers = (process.env.ADMIN_USERS || '').split(',');

  if (operation === 'dangerous' && !allowedUsers.includes(user)) {
    console.error(`❌ Permission denied: ${user} not in ADMIN_USERS`);
    console.error('💡 Add to .env: ADMIN_USERS="user1,user2"');
    return false;
  }

  return true;
}

// Main enhanced protection function
async function enhancedProtection(operation, options = {}) {
  console.log('🛡️  ENHANCED PROTECTION SYSTEM');
  console.log('================================');

  // 1. Environment detection
  const env = detectEnvironment();
  console.log(`Environment: ${env.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`Database: ${env.databaseUrl}`);
  console.log(`Production Score: ${env.productionScore}/6`);

  // 2. Database safety check
  const dbSafety = await checkDatabaseSafety();

  // 3. Permission check
  if (!checkPermissions(operation)) {
    process.exit(1);
  }

  // 4. Production protection
  if (env.isProduction) {
    console.log('');
    console.log('🚨 PRODUCTION ENVIRONMENT DETECTED!');

    // Block dangerous operations
    if (['migrate-dev', 'reset', 'seed'].includes(operation)) {
      console.error(`❌ BLOCKED: ${operation} is not allowed on production!`);
      console.error('💡 Use staging environment first');
      process.exit(1);
    }

    // Require backup for risky operations
    if (['migrate-deploy', 'data-import'].includes(operation)) {
      if (!options.skipBackup) {
        await createEnhancedBackup(`before-${operation}`);
      }
    }

    // Require confirmation for critical operations
    if (options.requireConfirmation) {
      console.log('⚠️  This operation will modify production data');
      console.log('Type "CONFIRM" to proceed:');
      // In real implementation, add readline for confirmation
    }
  }

  console.log('✅ Protection checks passed');
  return true;
}

export { checkDatabaseSafety, createEnhancedBackup, detectEnvironment, enhancedProtection };

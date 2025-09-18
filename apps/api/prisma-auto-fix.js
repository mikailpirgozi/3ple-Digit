#!/usr/bin/env node
/* eslint-disable */

/**
 * 🔧 PRISMA AUTO-FIX SCRIPT
 *
 * Tento skript automaticky opraví Prisma klienta keď sa zmení schéma.
 * Spustí sa automaticky pri každom štarte servera.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`🔧 [Prisma Auto-Fix] ${message}`);
}

function checkAndFixPrisma() {
  try {
    // 1. Skontroluj či existuje schema.prisma
    const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
    if (!fs.existsSync(schemaPath)) {
      log('❌ Schema.prisma not found');
      return;
    }

    // 2. Prečítaj schému a zisti provider
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const providerMatch = schemaContent.match(/provider\s*=\s*"([^"]+)"/);

    if (!providerMatch) {
      log('❌ Cannot detect database provider in schema');
      return;
    }

    const currentProvider = providerMatch[1];
    log(`📋 Current schema provider: ${currentProvider}`);

    // 3. Skontroluj DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL || '';
    const isPostgres =
      databaseUrl.includes('postgresql://') ||
      databaseUrl.includes('postgres://') ||
      databaseUrl.includes('rlwy.net') ||
      databaseUrl.includes('railway.app');
    const isSqlite = databaseUrl.includes('file:') || databaseUrl.includes('.db');

    log(`🔗 DATABASE_URL type: ${isPostgres ? 'PostgreSQL' : isSqlite ? 'SQLite' : 'Unknown'}`);
    log(`🔗 DATABASE_URL: ${databaseUrl.substring(0, 30)}...`);

    // 4. Zisti či je potrebná oprava
    const needsFix =
      (isPostgres && currentProvider !== 'postgresql') ||
      (isSqlite && currentProvider !== 'sqlite');

    if (!needsFix) {
      log('✅ Schema provider matches DATABASE_URL - no fix needed');
      return;
    }

    // 5. Oprav provider
    const correctProvider = isPostgres ? 'postgresql' : 'sqlite';
    log(`🔄 Fixing provider: ${currentProvider} → ${correctProvider}`);

    const fixedSchema = schemaContent.replace(
      /provider\s*=\s*"[^"]+"/,
      `provider = "${correctProvider}"`
    );

    fs.writeFileSync(schemaPath, fixedSchema);
    log(`✅ Schema provider updated to: ${correctProvider}`);

    // 6. Vyčisti cache a regeneruj Prisma klienta
    log('🔄 Cleaning Prisma cache...');
    try {
      execSync('rm -rf node_modules/.prisma', { stdio: 'pipe' });
    } catch (e) {
      // Ignore if directory doesn't exist
    }

    log('🔄 Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    log('✅ Prisma client regenerated successfully');

    // 7. Dodatočná kontrola
    log('🔍 Verifying fix...');
    const verifySchema = fs.readFileSync(schemaPath, 'utf8');
    const verifyMatch = verifySchema.match(/provider\s*=\s*"([^"]+)"/);
    if (verifyMatch && verifyMatch[1] === correctProvider) {
      log('✅ Fix verified successfully');
    } else {
      log('⚠️ Fix verification failed - manual check needed');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    // Don't exit - let the app continue and fail gracefully later if needed
  }
}

// Spusti opravu
checkAndFixPrisma();

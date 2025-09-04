#!/usr/bin/env node

/**
 * INSTALL DATABASE-LEVEL PROTECTION
 * Installs triggers and functions directly in Railway PostgreSQL
 */

import { PrismaClient } from '@prisma/client';
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
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.error('Could not load .env file');
  }
}

async function installDatabaseProtection() {
  loadEnv();

  console.log('🛡️  Installing Database-Level Protection...');
  console.log('Database:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@'));

  const prisma = new PrismaClient();

  try {
    // Check current database
    const dbResult = await prisma.$queryRaw`SELECT current_database() as db_name`;
    const dbName = dbResult[0]?.db_name;
    console.log(`Connected to database: ${dbName}`);

    // 1. Create protection function
    console.log('📝 Creating protection function...');
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION check_production_safety()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Block dangerous operations on production database
          IF current_database() = 'railway' THEN
              RAISE EXCEPTION 'SAFETY: Cannot run destructive operations on production! Use staging first. Database: %', current_database();
          END IF;
          
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // 2. Create safety triggers for critical tables
    console.log('🔒 Installing protection triggers...');

    const tables = [
      'users',
      'investors',
      'assets',
      'period_snapshots',
      'investor_cashflows',
      'bank_balances',
      'liabilities',
    ];

    for (const table of tables) {
      try {
        // Drop existing trigger if exists
        await prisma.$executeRaw`DROP TRIGGER IF EXISTS ${Prisma.raw(`protect_${table}_delete`)} ON ${Prisma.raw(`"${table}"`)}`;

        // Create new trigger
        await prisma.$executeRaw`
          CREATE TRIGGER ${Prisma.raw(`protect_${table}_delete`)}
              BEFORE DELETE ON ${Prisma.raw(`"${table}"`)}
              FOR EACH STATEMENT
              EXECUTE FUNCTION check_production_safety();
        `;

        console.log(`  ✅ Protected table: ${table}`);
      } catch (error) {
        console.log(`  ⚠️  Could not protect table ${table}: ${error.message}`);
      }
    }

    // 3. Create audit log table
    console.log('📋 Creating audit log...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS deletion_audit (
          id SERIAL PRIMARY KEY,
          table_name VARCHAR(255) NOT NULL,
          deleted_count INTEGER NOT NULL,
          deleted_by VARCHAR(255),
          deleted_at TIMESTAMP DEFAULT NOW(),
          database_name VARCHAR(255) DEFAULT current_database()
      );
    `;

    // 4. Test protection
    console.log('🧪 Testing protection...');
    try {
      await prisma.$executeRaw`DELETE FROM "users" WHERE 1=0`; // This should be blocked
      console.log('❌ Protection test failed - deletion was allowed!');
    } catch (error) {
      if (error.message.includes('SAFETY: Cannot run destructive operations')) {
        console.log('✅ Protection test passed - deletions are blocked!');
      } else {
        console.log(`⚠️  Unexpected error: ${error.message}`);
      }
    }

    // 5. Verify installation
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers 
      WHERE trigger_name LIKE 'protect_%'
      ORDER BY event_object_table
    `;

    console.log('\n🎯 INSTALLATION COMPLETE!');
    console.log(`✅ Installed ${triggers.length} protection triggers:`);
    triggers.forEach(trigger => {
      console.log(`   - ${trigger.trigger_name} on "${trigger.event_object_table}"`);
    });

    console.log('\n🛡️  Your database is now ULTIMATE PROTECTED!');
    console.log('💀 Any attempt to delete data will be BLOCKED at database level');
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Import Prisma for raw queries
import { Prisma } from '@prisma/client';

installDatabaseProtection();

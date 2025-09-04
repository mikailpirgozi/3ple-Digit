#!/usr/bin/env node

/**
 * SAFE PRODUCTION DATA SYNC
 * Downloads production data to local SQLite for development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function syncProductionData() {
  console.log('🔄 Syncing production data to development...');

  // 1. Create backup of production data
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `prod-sync-${timestamp}.sql`;

  try {
    // 2. Export production data
    console.log('📥 Downloading production data...');
    execSync(`railway run 'pg_dump $DATABASE_URL --data-only --inserts' > ${backupFile}`, {
      stdio: 'inherit',
    });

    // 3. Switch to local SQLite
    const originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'file:./prisma/dev.db';

    // 4. Reset local database
    console.log('🗑️  Clearing local database...');
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });

    // 5. Import production data to SQLite
    console.log('📤 Importing to local SQLite...');

    // Convert PostgreSQL dump to SQLite compatible format
    let sqlContent = fs.readFileSync(backupFile, 'utf8');

    // Basic PostgreSQL → SQLite conversions
    sqlContent = sqlContent
      .replace(/INSERT INTO "([^"]+)"/g, 'INSERT INTO $1') // Remove quotes from table names
      .replace(/::[\w\[\]]+/g, '') // Remove PostgreSQL type casts
      .replace(/COPY .+ FROM stdin;[\s\S]*?\\\.[\s\S]*?/g, '') // Remove COPY statements
      .replace(/SELECT pg_catalog\.setval\(.+\);/g, ''); // Remove sequence updates

    // Write converted SQL
    const sqliteFile = `${backupFile}.sqlite`;
    fs.writeFileSync(sqliteFile, sqlContent);

    // Import to SQLite
    execSync(`sqlite3 prisma/dev.db < ${sqliteFile}`, { stdio: 'inherit' });

    // 6. Cleanup
    fs.unlinkSync(backupFile);
    fs.unlinkSync(sqliteFile);

    console.log('✅ Production data synced to development!');
    console.log('💡 Your local SQLite now has the same data as production');
  } catch (error) {
    console.error('❌ Sync failed:', error.message);

    // Cleanup on error
    if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile);
    if (fs.existsSync(`${backupFile}.sqlite`)) fs.unlinkSync(`${backupFile}.sqlite`);

    process.exit(1);
  }
}

function main() {
  console.log('🔄 PRODUCTION DATA SYNC');
  console.log('This will replace your local development data with production data');
  console.log('');

  syncProductionData();
}

if (require.main === module) {
  main();
}

module.exports = { syncProductionData };

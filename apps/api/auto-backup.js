#!/usr/bin/env node

/**
 * AUTOMATIC DATABASE BACKUP SCRIPT
 * Creates timestamped backups before dangerous operations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups');

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `auto-backup-${timestamp}.sql`);

  try {
    console.log('🔄 Creating automatic backup...');

    // Use Railway CLI to create backup
    const command = `railway run 'pg_dump $DATABASE_URL --data-only --inserts' > "${backupFile}"`;
    execSync(command, { stdio: 'inherit' });

    console.log(`✅ Backup created: ${backupFile}`);

    // Keep only last 10 backups
    cleanOldBackups(backupDir);

    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

function cleanOldBackups(backupDir) {
  try {
    const files = fs
      .readdirSync(backupDir)
      .filter(file => file.startsWith('auto-backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime,
      }))
      .sort((a, b) => b.time - a.time); // Newest first

    // Keep only 10 most recent backups
    if (files.length > 10) {
      const filesToDelete = files.slice(10);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.warn('⚠️  Could not clean old backups:', error.message);
  }
}

function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  // Only backup production databases
  const isProduction = databaseUrl.includes('railway.app') || databaseUrl.includes('rlwy.net');

  if (!isProduction) {
    console.log('ℹ️  Skipping backup for non-production database');
    return;
  }

  createBackup();
}

if (require.main === module) {
  main();
}

module.exports = { createBackup };

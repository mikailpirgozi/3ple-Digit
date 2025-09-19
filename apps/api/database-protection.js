#!/usr/bin/env node

/**
 * 🛡️ ULTIMATE DATABASE PROTECTION SYSTEM
 * 
 * Tento script poskytuje maximálnu ochranu Railway PostgreSQL databázy:
 * 1. Automatické zálohy pred každou zmenou
 * 2. Blokovanie nebezpečných príkazov na produkcii
 * 3. Kontrola prostredia
 * 4. Bezpečné migrácie
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const scriptDir = path.dirname(process.argv[1]);

// 🚨 PRODUCTION DATABASE PROTECTION
const PRODUCTION_INDICATORS = [
  'railway.app',
  'rlwy.net',
  'nozomi.proxy.rlwy.net'
];

const DANGEROUS_COMMANDS = [
  'prisma db push',
  'prisma migrate reset',
  'prisma db seed --force',
  'DROP TABLE',
  'TRUNCATE',
  'DELETE FROM'
];

class DatabaseProtection {
  constructor() {
    this.databaseUrl = process.env.DATABASE_URL || '';
    this.isProduction = this.checkIfProduction();
    this.backupDir = path.join(scriptDir, 'backups');
    this.ensureBackupDir();
  }

  checkIfProduction() {
    const nodeEnv = process.env.NODE_ENV;
    const railwayEnv = process.env.RAILWAY_ENVIRONMENT;
    
    return (
      nodeEnv === 'production' ||
      railwayEnv === 'production' ||
      PRODUCTION_INDICATORS.some(indicator => 
        this.databaseUrl.includes(indicator)
      )
    );
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  generateBackupFilename(prefix = 'backup') {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('.')[0];
    return `${prefix}_${timestamp}.sql`;
  }

  async createBackup(reason = 'manual') {
    if (!this.databaseUrl) {
      throw new Error('❌ DATABASE_URL not found');
    }

    const filename = this.generateBackupFilename(`${reason}_backup`);
    const filepath = path.join(this.backupDir, filename);

    console.log(`🔄 Creating backup: ${filename}`);
    console.log(`📍 Reason: ${reason}`);

    try {
      // Use pg_dump to create backup
      execSync(`pg_dump "${this.databaseUrl}" > "${filepath}"`, {
        stdio: 'inherit'
      });

      console.log(`✅ Backup created successfully: ${filepath}`);
      
      // Keep only last 10 backups
      this.cleanupOldBackups();
      
      return filepath;
    } catch (error) {
      console.error(`❌ Backup failed:`, error.message);
      throw error;
    }
  }

  cleanupOldBackups() {
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(this.backupDir, file),
        mtime: fs.statSync(path.join(this.backupDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Keep only 10 most recent backups
    if (files.length > 10) {
      const filesToDelete = files.slice(10);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
    }
  }

  blockDangerousCommand(command) {
    if (!this.isProduction) {
      console.log('⚠️  Development environment - command allowed');
      return false;
    }

    const isDangerous = DANGEROUS_COMMANDS.some(dangerous => 
      command.toLowerCase().includes(dangerous.toLowerCase())
    );

    if (isDangerous) {
      console.error('🚨 DANGEROUS COMMAND BLOCKED ON PRODUCTION!');
      console.error(`Command: ${command}`);
      console.error('Use safe migration commands instead:');
      console.error('  - npx prisma migrate dev --name describe_change');
      console.error('  - npx prisma migrate deploy');
      throw new Error('PRODUCTION SAFETY: Dangerous command blocked');
    }

    return false;
  }

  async safeMigration(migrationName) {
    if (!migrationName) {
      throw new Error('Migration name is required');
    }

    console.log('🛡️  Starting SAFE MIGRATION process...');

    // 1. Create backup before migration
    const backupPath = await this.createBackup(`pre_migration_${migrationName}`);

    try {
      // 2. Run migration
      console.log('🔄 Running migration...');
      
      if (this.isProduction) {
        // Production: use migrate deploy
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } else {
        // Development: use migrate dev
        execSync(`npx prisma migrate dev --name "${migrationName}"`, { 
          stdio: 'inherit' 
        });
      }

      // 3. Generate Prisma client
      console.log('🔄 Generating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });

      console.log('✅ Migration completed successfully!');
      console.log(`📁 Backup saved at: ${backupPath}`);

    } catch (error) {
      console.error('❌ Migration failed!');
      console.error(`📁 Backup available at: ${backupPath}`);
      console.error('To restore: psql $DATABASE_URL < ' + backupPath);
      throw error;
    }
  }

  async restoreFromBackup(backupPath) {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    console.log(`🔄 Restoring from backup: ${backupPath}`);
    
    // Create backup of current state before restore
    await this.createBackup('pre_restore');

    try {
      execSync(`psql "${this.databaseUrl}" < "${backupPath}"`, {
        stdio: 'inherit'
      });
      console.log('✅ Database restored successfully!');
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      throw error;
    }
  }

  listBackups() {
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(this.backupDir, file),
        size: fs.statSync(path.join(this.backupDir, file)).size,
        mtime: fs.statSync(path.join(this.backupDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    console.log('📁 Available backups:');
    files.forEach((file, index) => {
      const sizeKB = Math.round(file.size / 1024);
      console.log(`${index + 1}. ${file.name} (${sizeKB}KB) - ${file.mtime.toLocaleString()}`);
    });

    return files;
  }

  getStatus() {
    return {
      isProduction: this.isProduction,
      databaseUrl: this.databaseUrl ? '***PROTECTED***' : 'NOT SET',
      backupDir: this.backupDir,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT
      }
    };
  }
}

// CLI Interface
const isMainModule = process.argv[1] && process.argv[1].endsWith('database-protection.js');
if (isMainModule) {
  const protection = new DatabaseProtection();
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'backup':
        await protection.createBackup(arg || 'manual');
        break;
        
      case 'migrate':
        if (!arg) {
          console.error('❌ Migration name required: node database-protection.js migrate "migration_name"');
          process.exit(1);
        }
        await protection.safeMigration(arg);
        break;
        
      case 'restore':
        if (!arg) {
          console.error('❌ Backup path required: node database-protection.js restore path/to/backup.sql');
          process.exit(1);
        }
        await protection.restoreFromBackup(arg);
        break;
        
      case 'list':
        protection.listBackups();
        break;
        
      case 'status':
        console.log('🛡️  Database Protection Status:');
        console.log(JSON.stringify(protection.getStatus(), null, 2));
        break;
        
      case 'check':
        protection.blockDangerousCommand(arg || '');
        console.log('✅ Command is safe');
        break;
        
      default:
        console.log('🛡️  Database Protection System');
        console.log('');
        console.log('Usage:');
        console.log('  node database-protection.js backup [reason]     - Create backup');
        console.log('  node database-protection.js migrate "name"      - Safe migration');
        console.log('  node database-protection.js restore backup.sql  - Restore backup');
        console.log('  node database-protection.js list                - List backups');
        console.log('  node database-protection.js status              - Show status');
        console.log('  node database-protection.js check "command"     - Check if command is safe');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = DatabaseProtection;

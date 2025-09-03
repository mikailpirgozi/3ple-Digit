import fs from 'fs/promises';
import path from 'path';
import { log } from './logger.js';
import { prisma } from './prisma.js';
// Prisma types handled via any for CI compatibility

interface BackupData {
  timestamp: string;
  users: any[];
  investors: any[];
  investorCashflows: any[];
  assets: any[];
  assetEvents: any[];
  liabilities: any[];
  bankBalances: any[];
  periodSnapshots: any[];
  investorSnapshots: any[];
  documents: any[];
  auditLogs: any[];
}

/**
 * Create a complete database backup
 */
export async function createBackup(filename?: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = filename || `backup-${timestamp}.json`;
  const backupPath = path.join(process.cwd(), 'backups', backupFilename);

  log.info('🔄 Creating database backup...', { filename: backupFilename });

  try {
    // Ensure backup directory exists
    await fs.mkdir(path.dirname(backupPath), { recursive: true });

    // Fetch all data
    const [
      users,
      investors,
      investorCashflows,
      assets,
      assetEvents,
      liabilities,
      bankBalances,
      periodSnapshots,
      investorSnapshots,
      documents,
      auditLogs,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.investor.findMany(),
      prisma.investorCashflow.findMany(),
      prisma.asset.findMany(),
      prisma.assetEvent.findMany(),
      prisma.liability.findMany(),
      prisma.bankBalance.findMany(),
      prisma.periodSnapshot.findMany(),
      prisma.investorSnapshot.findMany(),
      prisma.document.findMany(),
      prisma.auditLog.findMany(),
    ]);

    const backupData: BackupData = {
      timestamp,
      users,
      investors,
      investorCashflows,
      assets,
      assetEvents,
      liabilities,
      bankBalances,
      periodSnapshots,
      investorSnapshots,
      documents,
      auditLogs,
    };

    // Write backup file
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

    const stats = await fs.stat(backupPath);
    log.info('✅ Backup created successfully', {
      filename: backupFilename,
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      records: {
        users: users.length,
        investors: investors.length,
        assets: assets.length,
        total:
          users.length +
          investors.length +
          investorCashflows.length +
          assets.length +
          assetEvents.length +
          liabilities.length +
          bankBalances.length +
          periodSnapshots.length +
          investorSnapshots.length +
          documents.length +
          auditLogs.length,
      },
    });

    // Explicitly disconnect from database
    await prisma.$disconnect();

    return backupPath;
  } catch (error) {
    log.error('❌ Backup failed', { error: error instanceof Error ? error.message : error });
    throw error;
  }
}

/**
 * Restore database from backup
 */
export async function restoreBackup(backupPath: string): Promise<void> {
  log.info('🔄 Restoring database from backup...', { backupPath });

  try {
    // Read backup file
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    const backupData: BackupData = JSON.parse(backupContent);

    log.info('📊 Backup info', {
      timestamp: backupData.timestamp,
      records: {
        users: backupData.users.length,
        investors: backupData.investors.length,
        assets: backupData.assets.length,
      },
    });

    // SAFETY CHECK - never restore to production without explicit confirmation
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailwayEnv = process.env.RAILWAY_ENVIRONMENT === 'production';
    const hasProductionUrl =
      process.env.DATABASE_URL?.includes('railway.app') ||
      process.env.DATABASE_URL?.includes('rlwy.net');

    if (isProduction || isRailwayEnv || hasProductionUrl) {
      if (!process.env.FORCE_PRODUCTION_RESTORE) {
        log.error(
          '🚨 RESTORE BLOCKED: Cannot restore to production database without FORCE_PRODUCTION_RESTORE=true'
        );
        throw new Error(
          'PRODUCTION RESTORE BLOCKED: Set FORCE_PRODUCTION_RESTORE=true to override'
        );
      }
      log.warn('⚠️ PRODUCTION RESTORE: Proceeding with forced restore');
    }

    // Clear existing data (in transaction)
    await prisma.$transaction(async (tx: any) => {
      log.info('🧹 Clearing existing data...');
      await tx.auditLog.deleteMany();
      await tx.document.deleteMany();
      await tx.investorSnapshot.deleteMany();
      await tx.periodSnapshot.deleteMany();
      await tx.bankBalance.deleteMany();
      await tx.liability.deleteMany();
      await tx.assetEvent.deleteMany();
      await tx.asset.deleteMany();
      await tx.investorCashflow.deleteMany();
      await tx.investor.deleteMany();
      await tx.user.deleteMany();

      log.info('📥 Restoring data...');

      // Restore in correct order (respecting foreign keys)
      if (backupData.users.length > 0) {
        await tx.user.createMany({ data: backupData.users });
      }
      if (backupData.investors.length > 0) {
        await tx.investor.createMany({ data: backupData.investors });
      }
      if (backupData.investorCashflows.length > 0) {
        await tx.investorCashflow.createMany({ data: backupData.investorCashflows });
      }
      if (backupData.assets.length > 0) {
        await tx.asset.createMany({ data: backupData.assets });
      }
      if (backupData.assetEvents.length > 0) {
        await tx.assetEvent.createMany({ data: backupData.assetEvents });
      }
      if (backupData.liabilities.length > 0) {
        await tx.liability.createMany({ data: backupData.liabilities });
      }
      if (backupData.bankBalances.length > 0) {
        await tx.bankBalance.createMany({ data: backupData.bankBalances });
      }
      if (backupData.periodSnapshots.length > 0) {
        await tx.periodSnapshot.createMany({ data: backupData.periodSnapshots });
      }
      if (backupData.investorSnapshots.length > 0) {
        await tx.investorSnapshot.createMany({ data: backupData.investorSnapshots });
      }
      if (backupData.documents.length > 0) {
        await tx.document.createMany({ data: backupData.documents });
      }
      if (backupData.auditLogs.length > 0) {
        await tx.auditLog.createMany({ data: backupData.auditLogs });
      }
    });

    log.info('✅ Database restored successfully');
  } catch (error) {
    log.error('❌ Restore failed', { error: error instanceof Error ? error.message : error });
    throw error;
  } finally {
    // Explicitly disconnect from database
    await prisma.$disconnect();
  }
}

/**
 * List available backups
 */
export async function listBackups(): Promise<string[]> {
  const backupDir = path.join(process.cwd(), 'backups');

  try {
    const files = await fs.readdir(backupDir);
    return files
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse();
  } catch (error) {
    log.warn('No backup directory found');
    return [];
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'backup':
      createBackup(process.argv[3])
        .then(path => {
          console.log(`Backup created: ${path}`);
          process.exit(0);
        })
        .catch(error => {
          console.error('Backup failed:', error);
          process.exit(1);
        });
      break;

    case 'restore':
      const backupPath = process.argv[3];
      if (!backupPath) {
        console.error('Usage: tsx backup-restore.ts restore <backup-file>');
        process.exit(1);
      }
      restoreBackup(backupPath)
        .then(() => {
          console.log('Restore completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('Restore failed:', error);
          process.exit(1);
        });
      break;

    case 'list':
      listBackups()
        .then(backups => {
          console.log('Available backups:');
          backups.forEach(backup => console.log(`  ${backup}`));
          process.exit(0);
        })
        .catch(error => {
          console.error('List failed:', error);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage:');
      console.log('  tsx backup-restore.ts backup [filename]');
      console.log('  tsx backup-restore.ts restore <backup-file>');
      console.log('  tsx backup-restore.ts list');
      process.exit(1);
  }
}

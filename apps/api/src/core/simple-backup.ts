#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { log } from './logger.js';
import { prisma } from './prisma.js';

async function createQuickBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.json`;
  const backupPath = path.join(process.cwd(), 'backups', filename);

  try {
    log.info('🔄 Creating quick backup...', { filename });

    // Ensure backup directory exists
    await fs.mkdir(path.dirname(backupPath), { recursive: true });

    // Get counts first
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.investor.count(),
      prisma.asset.count(),
      prisma.bankBalance.count(),
      prisma.liability.count(),
    ]);

    log.info('📊 Database stats', {
      users: counts[0],
      investors: counts[1],
      assets: counts[2],
      bankBalances: counts[3],
      liabilities: counts[4],
    });

    // Get all data in smaller batches
    const users = await prisma.user.findMany();
    const investors = await prisma.investor.findMany();
    const investorCashflows = await prisma.investorCashflow.findMany();
    const assets = await prisma.asset.findMany();
    const assetEvents = await prisma.assetEvent.findMany();
    const liabilities = await prisma.liability.findMany();
    const bankBalances = await prisma.bankBalance.findMany();
    const periodSnapshots = await prisma.periodSnapshot.findMany();
    const investorSnapshots = await prisma.investorSnapshot.findMany();
    const documents = await prisma.document.findMany();
    const auditLogs = await prisma.auditLog.findMany();

    const backupData = {
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

    // Write backup
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

    const stats = await fs.stat(backupPath);
    const totalRecords =
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
      auditLogs.length;

    log.info('✅ Backup completed', {
      filename,
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      totalRecords,
      path: backupPath,
    });

    // eslint-disable-next-line no-console
    console.log(`\n✅ Backup created: ${backupPath}`);
    // eslint-disable-next-line no-console
    console.log(`📊 Total records: ${totalRecords}`);
    // eslint-disable-next-line no-console
    console.log(`💾 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    log.error('❌ Backup failed', { error: error instanceof Error ? error.message : error });
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  void createQuickBackup();
}

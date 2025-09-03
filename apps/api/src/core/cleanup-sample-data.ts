import { log } from './logger.js';
import { prisma } from './prisma.js';

/**
 * Script na vymazanie všetkých vzorových dát z databázy
 * Vymaže všetky záznamy vytvorené seed scriptom
 */
async function cleanupSampleData() {
  console.log('🧹 Starting cleanup of sample data...');

  try {
    // CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailwayEnv = process.env.RAILWAY_ENVIRONMENT === 'production';
    const hasProductionUrl =
      process.env.DATABASE_URL?.includes('railway.app') ||
      process.env.DATABASE_URL?.includes('rlwy.net');

    if (isProduction || isRailwayEnv || hasProductionUrl) {
      log.error('🚨 CLEANUP BLOCKED: Cannot cleanup production database!');
      log.error('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        RAILWAY_ENV: process.env.RAILWAY_ENVIRONMENT,
      });
      throw new Error('PRODUCTION CLEANUP BLOCKED: Use manual data management for production');
    }
    // Získame počty záznamov pred vymazaním
    const beforeCounts = {
      users: await prisma.user.count(),
      investors: await prisma.investor.count(),
      assets: await prisma.asset.count(),
      liabilities: await prisma.liability.count(),
      bankBalances: await prisma.bankBalance.count(),
      snapshots: await prisma.periodSnapshot.count(),
      documents: await prisma.document.count(),
      auditLogs: await prisma.auditLog.count(),
    };

    console.log('📊 Current data counts:', beforeCounts);

    // Vymazanie v správnom poradí (kvôli foreign key constraints)
    console.log('🗑️  Deleting audit logs...');
    await prisma.auditLog.deleteMany();

    console.log('🗑️  Deleting documents...');
    await prisma.document.deleteMany();

    console.log('🗑️  Deleting investor snapshots...');
    await prisma.investorSnapshot.deleteMany();

    console.log('🗑️  Deleting period snapshots...');
    await prisma.periodSnapshot.deleteMany();

    console.log('🗑️  Deleting bank balances...');
    await prisma.bankBalance.deleteMany();

    console.log('🗑️  Deleting liabilities...');
    const deletedLiabilities = await prisma.liability.deleteMany();
    console.log(`   Deleted ${deletedLiabilities.count} liabilities`);

    console.log('🗑️  Deleting asset events...');
    await prisma.assetEvent.deleteMany();

    console.log('🗑️  Deleting assets...');
    const deletedAssets = await prisma.asset.deleteMany();
    console.log(`   Deleted ${deletedAssets.count} assets`);

    console.log('🗑️  Deleting investor cashflows...');
    await prisma.investorCashflow.deleteMany();

    console.log('🗑️  Deleting investors...');
    const deletedInvestors = await prisma.investor.deleteMany();
    console.log(`   Deleted ${deletedInvestors.count} investors`);

    console.log('🗑️  Deleting users...');
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`   Deleted ${deletedUsers.count} users`);

    // Získame počty záznamov po vymazaní
    const afterCounts = {
      users: await prisma.user.count(),
      investors: await prisma.investor.count(),
      assets: await prisma.asset.count(),
      liabilities: await prisma.liability.count(),
      bankBalances: await prisma.bankBalance.count(),
      snapshots: await prisma.periodSnapshot.count(),
      documents: await prisma.document.count(),
      auditLogs: await prisma.auditLog.count(),
    };

    console.log('✅ Sample data cleanup completed successfully!');
    console.log('📊 Data counts after cleanup:', afterCounts);

    // Súhrn vymazaných záznamov
    const deletedCounts = {
      users: beforeCounts.users - afterCounts.users,
      investors: beforeCounts.investors - afterCounts.investors,
      assets: beforeCounts.assets - afterCounts.assets,
      liabilities: beforeCounts.liabilities - afterCounts.liabilities,
      bankBalances: beforeCounts.bankBalances - afterCounts.bankBalances,
      snapshots: beforeCounts.snapshots - afterCounts.snapshots,
      documents: beforeCounts.documents - afterCounts.documents,
      auditLogs: beforeCounts.auditLogs - afterCounts.auditLogs,
    };

    console.log('🗑️  Summary of deleted records:', deletedCounts);

    const totalDeleted = Object.values(deletedCounts).reduce((sum, count) => sum + count, 0);
    console.log(`🎉 Total records deleted: ${totalDeleted}`);
  } catch (error) {
    console.error('❌ Sample data cleanup failed:', error);
    throw error;
  }
}

// Spustenie scriptu ak je volaný priamo
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupSampleData()
    .then(() => {
      log.info('✅ Cleanup completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      log.error('❌ Cleanup failed:', { error: error.message });
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { cleanupSampleData };

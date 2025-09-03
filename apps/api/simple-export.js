// Ultra simple data export - no hanging connections
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function simpleExport() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Exporting data...');

    // Get basic counts first
    const userCount = await prisma.user.count();
    const assetCount = await prisma.asset.count();
    const investorCount = await prisma.investor.count();

    console.log(`📊 Found: ${userCount} users, ${assetCount} assets, ${investorCount} investors`);

    if (userCount === 0) {
      console.log('⚠️ No data found in database');
      return;
    }

    // Export just the essential data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const assets = await prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        currentValue: true,
        status: true,
      },
    });

    const investors = await prisma.investor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    const timestamp = new Date().toISOString();
    const exportData = {
      timestamp,
      summary: {
        users: users.length,
        assets: assets.length,
        investors: investors.length,
      },
      users,
      assets,
      investors,
    };

    // Write to file
    const filename = `export-${timestamp.replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));

    console.log(`✅ Export completed: ${filename}`);
    console.log(`📊 Total records: ${users.length + assets.length + investors.length}`);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    // Force disconnect and exit
    await prisma.$disconnect();
    setTimeout(() => process.exit(0), 100);
  }
}

simpleExport();

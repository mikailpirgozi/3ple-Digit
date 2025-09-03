// Simple manual backup script
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backup() {
  console.log('🔄 Starting backup...');

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `manual-backup-${timestamp}.json`;
    const backupDir = path.join(__dirname, 'backups');

    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, filename);

    // Get data
    console.log('📊 Fetching data...');
    const users = await prisma.user.findMany();
    const investors = await prisma.investor.findMany();
    const assets = await prisma.asset.findMany();
    const bankBalances = await prisma.bankBalance.findMany();
    const liabilities = await prisma.liability.findMany();

    const backupData = {
      timestamp,
      users,
      investors,
      assets,
      bankBalances,
      liabilities,
    };

    // Write file
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    const stats = fs.statSync(backupPath);
    const totalRecords =
      users.length + investors.length + assets.length + bankBalances.length + liabilities.length;

    console.log(`✅ Backup completed!`);
    console.log(`📁 File: ${filename}`);
    console.log(`📊 Records: ${totalRecords}`);
    console.log(`💾 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📍 Path: ${backupPath}`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

backup();

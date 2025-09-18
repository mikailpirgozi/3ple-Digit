// Restore full data from SQLite to Railway PostgreSQL
const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function restoreData() {
  try {
    console.log('🔄 Starting full data restore...');
    
    // Open SQLite database
    const db = new sqlite3.Database('./prisma/test 2.db');
    
    // Helper function to run SQLite queries
    const runQuery = (query) => {
      return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    // 1. Create admin user first
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('Black123', 10);
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin2@3pledigit.sk' }
    });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: 'admin2@3pledigit.sk',
          name: 'admin',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin user created');
    }

    // 2. Restore Assets
    console.log('🏢 Restoring assets...');
    const assets = await runQuery('SELECT * FROM assets');
    
    for (const asset of assets) {
      await prisma.asset.create({
        data: {
          name: asset.name,
          type: asset.type,
          category: asset.category,
          description: asset.description,
          currentValue: asset.currentValue,
          status: asset.status || 'ACTIVE',
          acquiredPrice: asset.acquiredPrice,
          salePrice: asset.salePrice,
          saleDate: asset.saleDate ? new Date(asset.saleDate) : null,
          createdAt: new Date(asset.createdAt),
          updatedAt: new Date(asset.updatedAt)
        }
      });
    }
    console.log(`✅ Restored ${assets.length} assets`);

    // 3. Restore Bank Balances
    console.log('💰 Restoring bank balances...');
    const bankBalances = await runQuery('SELECT * FROM bank_balances');
    
    // Remove duplicates by creating a Set of unique combinations
    const uniqueBalances = [];
    const seen = new Set();
    
    for (const balance of bankBalances) {
      const key = `${balance.accountName}-${balance.bankName}-${balance.amount}-${balance.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBalances.push(balance);
      }
    }
    
    for (const balance of uniqueBalances) {
      await prisma.bankBalance.create({
        data: {
          accountName: balance.accountName,
          bankName: balance.bankName,
          accountType: balance.accountType,
          amount: balance.amount,
          currency: balance.currency || 'EUR',
          date: new Date(balance.date),
          createdAt: new Date(balance.createdAt),
          updatedAt: new Date(balance.updatedAt)
        }
      });
    }
    console.log(`✅ Restored ${uniqueBalances.length} unique bank balances`);

    // 4. Restore Liabilities
    console.log('📋 Restoring liabilities...');
    const liabilities = await runQuery('SELECT * FROM liabilities');
    
    for (const liability of liabilities) {
      await prisma.liability.create({
        data: {
          name: liability.name,
          description: liability.description,
          currentBalance: liability.currentBalance,
          interestRate: liability.interestRate,
          maturityDate: liability.maturityDate ? new Date(liability.maturityDate) : null,
          createdAt: new Date(liability.createdAt),
          updatedAt: new Date(liability.updatedAt)
        }
      });
    }
    console.log(`✅ Restored ${liabilities.length} liabilities`);

    // 5. Calculate totals
    const totalAssets = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalBankBalance = uniqueBalances.reduce((sum, balance) => sum + balance.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);
    const nav = totalAssets + totalBankBalance - totalLiabilities;

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Assets: ${assets.length} items, €${totalAssets.toLocaleString()}`);
    console.log(`✅ Bank Balances: ${uniqueBalances.length} accounts, €${totalBankBalance.toLocaleString()}`);
    console.log(`✅ Liabilities: ${liabilities.length} items, €${totalLiabilities.toLocaleString()}`);
    console.log(`✅ NAV: €${nav.toLocaleString()}`);

    db.close();
    console.log('\n🎉 Data restore completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during restore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();

import { prisma } from './prisma.js';
import { log } from './logger.js';
import bcrypt from 'bcrypt';

async function main() {
  log.info('🌱 Starting database seed...');

  try {
    // Clean existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      log.info('🧹 Cleaning existing data...');
      
      await prisma.auditLog.deleteMany();
      await prisma.document.deleteMany();
      await prisma.investorSnapshot.deleteMany();
      await prisma.periodSnapshot.deleteMany();
      await prisma.bankBalance.deleteMany();
      await prisma.liability.deleteMany();
      await prisma.assetEvent.deleteMany();
      await prisma.asset.deleteMany();
      await prisma.investorCashflow.deleteMany();
      await prisma.investor.deleteMany();
      await prisma.user.deleteMany();
    }

    // Create users
    log.info('👥 Creating users...');
    
      const adminUser = await prisma.user.create({
    data: {
      email: 'admin@3pledigit.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: await bcrypt.hash('admin123', 10),
    },
  });

      const internalUser = await prisma.user.create({
    data: {
      email: 'internal@3pledigit.com',
      name: 'Internal Manager',
      role: 'INTERNAL',
      password: await bcrypt.hash('internal123', 10),
    },
  });

      const investorUser1 = await prisma.user.create({
    data: {
      email: 'investor1@example.com',
      name: 'Investor One',
      role: 'INVESTOR',
      password: await bcrypt.hash('investor123', 10),
    },
  });

      const investorUser2 = await prisma.user.create({
    data: {
      email: 'investor2@example.com',
      name: 'Investor Two',
      role: 'INVESTOR',
      password: await bcrypt.hash('investor123', 10),
    },
  });

    // Create investors
    log.info('💼 Creating investors...');
    
    const investor1 = await prisma.investor.create({
      data: {
        userId: investorUser1.id,
        name: 'Investor One',
        email: 'investor1@example.com',
        phone: '+421 900 123 456',
        address: 'Bratislava, Slovakia',
        taxId: 'SK1234567890',
      },
    });

    const investor2 = await prisma.investor.create({
      data: {
        userId: investorUser2.id,
        name: 'Investor Two',
        email: 'investor2@example.com',
        phone: '+421 900 654 321',
        address: 'Košice, Slovakia',
        taxId: 'SK0987654321',
      },
    });

    // Create investor cashflows
    log.info('💰 Creating investor cashflows...');
    
    await prisma.investorCashflow.createMany({
      data: [
        {
          investorId: investor1.id,
          type: 'DEPOSIT',
          amount: 100000,
          date: new Date('2024-01-15'),
          note: 'Initial investment',
        },
        {
          investorId: investor1.id,
          type: 'DEPOSIT',
          amount: 50000,
          date: new Date('2024-03-15'),
          note: 'Additional investment',
        },
        {
          investorId: investor2.id,
          type: 'DEPOSIT',
          amount: 200000,
          date: new Date('2024-01-20'),
          note: 'Initial investment',
        },
        {
          investorId: investor2.id,
          type: 'WITHDRAWAL',
          amount: 25000,
          date: new Date('2024-04-10'),
          note: 'Partial withdrawal',
        },
      ],
    });

    // Create assets
    log.info('🏢 Creating assets...');
    
    const realEstateAsset = await prisma.asset.create({
      data: {
        name: 'Office Building Bratislava',
        type: 'REAL_ESTATE',
        description: 'Commercial office building in city center',
        currentValue: 500000,
      },
    });

    const loanAsset = await prisma.asset.create({
      data: {
        name: 'Business Loan - Company ABC',
        type: 'LOAN',
        description: 'Short-term business loan with 8% interest',
        currentValue: 150000,
      },
    });

    const stockAsset = await prisma.asset.create({
      data: {
        name: 'Tech Stocks Portfolio',
        type: 'STOCK',
        description: 'Diversified technology stocks',
        currentValue: 75000,
      },
    });

    // Create asset events
    log.info('📈 Creating asset events...');
    
    await prisma.assetEvent.createMany({
      data: [
        {
          assetId: realEstateAsset.id,
          type: 'VALUATION',
          amount: 500000,
          date: new Date('2024-01-01'),
          note: 'Initial valuation',
        },
        {
          assetId: realEstateAsset.id,
          type: 'CAPEX',
          amount: 25000,
          date: new Date('2024-02-15'),
          note: 'Renovation costs',
        },
        {
          assetId: loanAsset.id,
          type: 'VALUATION',
          amount: 150000,
          date: new Date('2024-01-10'),
          note: 'Loan principal',
        },
        {
          assetId: loanAsset.id,
          type: 'PAYMENT_IN',
          amount: 5000,
          date: new Date('2024-02-01'),
          note: 'Interest payment',
        },
        {
          assetId: stockAsset.id,
          type: 'VALUATION',
          amount: 75000,
          date: new Date('2024-01-05'),
          note: 'Market valuation',
        },
      ],
    });

    // Create liabilities
    log.info('💳 Creating liabilities...');
    
    await prisma.liability.createMany({
      data: [
        {
          name: 'Bank Loan - Property',
          description: 'Mortgage for office building',
          currentBalance: 200000,
          interestRate: 0.035,
          maturityDate: new Date('2029-01-01'),
        },
        {
          name: 'Credit Line',
          description: 'Business credit line',
          currentBalance: 50000,
          interestRate: 0.055,
        },
      ],
    });

    // Create bank balances
    log.info('🏦 Creating bank balances...');
    
    await prisma.bankBalance.createMany({
      data: [
        {
          accountName: 'Main Business Account',
          bankName: 'Slovenská sporiteľňa',
          accountType: 'Current',
          amount: 125000,
          currency: 'EUR',
          date: new Date('2024-04-30'),
        },
        {
          accountName: 'Reserve Account',
          bankName: 'VUB Banka',
          accountType: 'Savings',
          amount: 75000,
          currency: 'EUR',
          date: new Date('2024-04-30'),
        },
        {
          accountName: 'USD Account',
          bankName: 'Tatra Banka',
          accountType: 'Current',
          amount: 25000,
          currency: 'USD',
          date: new Date('2024-04-30'),
        },
      ],
    });

    // Create period snapshot
    log.info('📊 Creating period snapshot...');
    
    const snapshot = await prisma.periodSnapshot.create({
      data: {
        date: new Date('2024-04-30'),
        totalAssetValue: 725000, // Sum of all assets
        totalBankBalance: 225000, // Sum of all bank balances (EUR equivalent)
        totalLiabilities: 250000, // Sum of all liabilities
        nav: 700000, // NAV = assets + bank - liabilities
        performanceFeeRate: 0.20, // 20% performance fee
        totalPerformanceFee: 15000,
      },
    });

    // Create investor snapshots
    log.info('📈 Creating investor snapshots...');
    
    await prisma.investorSnapshot.createMany({
      data: [
        {
          snapshotId: snapshot.id,
          investorId: investor1.id,
          capitalAmount: 150000, // Total deposits - withdrawals
          ownershipPercent: 0.4615, // 46.15% ownership
          performanceFee: 6923, // Performance fee allocation
        },
        {
          snapshotId: snapshot.id,
          investorId: investor2.id,
          capitalAmount: 175000, // Total deposits - withdrawals
          ownershipPercent: 0.5385, // 53.85% ownership
          performanceFee: 8077, // Performance fee allocation
        },
      ],
    });

    // Create sample documents
    log.info('📄 Creating sample documents...');
    
    await prisma.document.createMany({
      data: [
        {
          name: 'Property Deed',
          originalName: 'office_building_deed.pdf',
          r2Key: 'documents/sample-deed.pdf',
          mimeType: 'application/pdf',
          size: 1024000,
          sha256: 'sample-hash-1',
          category: 'ASSET_DOCUMENT',
          description: 'Property ownership document',
          uploadedBy: adminUser.id,
        },
        {
          name: 'Bank Statement April 2024',
          originalName: 'bank_statement_2024_04.pdf',
          r2Key: 'documents/sample-statement.pdf',
          mimeType: 'application/pdf',
          size: 512000,
          sha256: 'sample-hash-2',
          category: 'BANK_STATEMENT',
          description: 'Monthly bank statement',
          uploadedBy: internalUser.id,
        },
      ],
    });

    // Create audit logs
    log.info('📝 Creating audit logs...');
    
    await prisma.auditLog.createMany({
      data: [
        {
          userId: adminUser.id,
          action: 'CREATE',
          entity: 'Asset',
          entityId: realEstateAsset.id,
          newData: JSON.stringify({ name: 'Office Building Bratislava', type: 'REAL_ESTATE' }),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script',
        },
        {
          userId: internalUser.id,
          action: 'CREATE',
          entity: 'PeriodSnapshot',
          entityId: snapshot.id,
          newData: JSON.stringify({ date: '2024-04-30', nav: 700000 }),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script',
        },
      ],
    });

    log.info('✅ Database seed completed successfully!');
    
    // Log summary
    const counts = {
      users: await prisma.user.count(),
      investors: await prisma.investor.count(),
      assets: await prisma.asset.count(),
      liabilities: await prisma.liability.count(),
      bankBalances: await prisma.bankBalance.count(),
      snapshots: await prisma.periodSnapshot.count(),
      documents: await prisma.document.count(),
    };
    
    log.info('📊 Seed summary:', counts);
    
  } catch (error) {
    log.error('❌ Database seed failed:', { error });
    throw error;
  }
}

main()
  .then(() => {
    log.info('✅ Database seed completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    log.error('❌ Database seed failed:', { error: e.message });
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

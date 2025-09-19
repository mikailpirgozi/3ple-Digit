import bcrypt from 'bcrypt';
import { log } from './logger';
import { prisma } from './prisma';

async function main() {
  log.info('🌱 Starting database seed...');

  try {
    // CRITICAL SAFETY CHECK - NEVER DELETE PRODUCTION DATA
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailwayEnv = process.env.RAILWAY_ENVIRONMENT === 'production';
    const hasProductionUrl =
      (process.env.DATABASE_URL?.includes('railway.app') ?? false) ||
      (process.env.DATABASE_URL?.includes('rlwy.net') ?? false);

    if (isProduction || isRailwayEnv || hasProductionUrl) {
      log.error('🚨 SEED BLOCKED: Cannot seed production database!');
      log.error('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        RAILWAY_ENV: process.env.RAILWAY_ENVIRONMENT,
      });
      throw new Error('PRODUCTION SEED BLOCKED: Use manual data import for production');
    }

    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      log.info('✅ Database already seeded, skipping seed process');
      log.info(`Found ${existingUsers} existing users`);
      return;
    }

    // Clean existing data (ONLY in local development)
    if (process.env.NODE_ENV === 'development' && !hasProductionUrl) {
      log.info('🧹 Cleaning existing LOCAL development data...');

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
    } else {
      log.info('⚠️ Skipping data cleanup - not in local development');
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

    // PÔŽIČKY (LOAN)
    log.info('💰 Creating loan assets...');
    const loanAssets = await Promise.all([
      prisma.asset.create({
        data: {
          name: 'Pôžička Jozef Leško',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Jozef Leško',
          currentValue: 69700,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička TM Slovakia',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre TM Slovakia',
          currentValue: 54060,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Jozef Solčan',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Jozef Solčan',
          currentValue: 188559,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Jozef Kiačik',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Jozef Kiačik',
          currentValue: 10000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Vicena',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Vicena',
          currentValue: 27680,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Pirgozi',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Pirgozi',
          currentValue: 188086,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Aqua technik',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Aqua technik',
          currentValue: 22520,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Unipharma',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Unipharma',
          currentValue: 21000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Papiernik',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Papiernik',
          currentValue: 18500,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička KC Trans',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre KC Trans',
          currentValue: 23600,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Maroš Čupka',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Maroš Čupka',
          currentValue: 52000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Richard Šebík',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Richard Šebík',
          currentValue: 5000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Miki dočasná',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Dočasná pôžička pre Miki',
          currentValue: 61109,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Solčan',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Solčan',
          currentValue: 51900,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Vicena (2)',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Druhá pôžička pre Vicena',
          currentValue: 52000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pôžička Ružbársky',
          type: 'LOAN',
          category: 'PÔŽIČKY',
          description: 'Pôžička pre Ružbársky',
          currentValue: 20000,
        },
      }),
    ]);

    // NEHNUTEĽNOSTI (REAL_ESTATE)
    log.info('🏠 Creating real estate assets...');
    const realEstateAssets = await Promise.all([
      prisma.asset.create({
        data: {
          name: 'Pozemok Opatová, 1990m2',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Pozemok v Opatovej s rozlohou 1990m2',
          currentValue: 120000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Logik Park',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Nehnuteľnosť Logik Park',
          currentValue: 544395,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Pozemky Kajal',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Pozemky v lokalite Kajal',
          currentValue: 53102,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Dom Partizánska',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Dom na Partizánskej ulici',
          currentValue: 52650,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Apartmány Vita',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Apartmánový komplex Vita',
          currentValue: 133171,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Dom Mitice',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Dom v Miticiach',
          currentValue: 32500,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Byt Bazovského',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Byt na Bazovského ulici',
          currentValue: 35000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Byt Ružinov',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Byt v Ružinove',
          currentValue: 160000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Miloslavov',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Nehnuteľnosť v Miloslavove',
          currentValue: 11285,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Byt Podsokolice',
          type: 'REAL_ESTATE',
          category: 'NEHNUTEĽNOSTI',
          description: 'Byt v Podsokoliciach',
          currentValue: 82690,
        },
      }),
    ]);

    // MATERIÁL (MATERIAL)
    log.info('🔧 Creating material assets...');
    await Promise.all([
      prisma.asset.create({
        data: {
          name: 'Materiál Mitice',
          type: 'MATERIAL',
          category: 'MATERIÁL',
          description: 'Stavebný materiál v Miticiach',
          currentValue: 3500,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Materiál Krovina',
          type: 'MATERIAL',
          category: 'MATERIÁL',
          description: 'Stavebný materiál v Krovine',
          currentValue: 8000,
        },
      }),
    ]);

    // AKCIE (STOCK)
    log.info('📈 Creating stock assets...');
    const stockAssets = await Promise.all([
      prisma.asset.create({
        data: {
          name: 'Akcie',
          type: 'STOCK',
          category: 'AKCIE',
          description: 'Portfólio akcií',
          currentValue: 7000,
        },
      }),
    ]);

    // PODIEL VO FIRME (COMPANY_SHARE)
    log.info('🏢 Creating company share assets...');
    await Promise.all([
      prisma.asset.create({
        data: {
          name: 'Axeler',
          type: 'COMPANY_SHARE',
          category: 'PODIEL VO FIRME',
          description: 'Podiel v spoločnosti Axeler',
          currentValue: 7850,
        },
      }),
    ]);

    // AUTÁ (VEHICLE)
    log.info('🚗 Creating vehicle assets...');
    await Promise.all([
      prisma.asset.create({
        data: {
          name: 'AUTÁ',
          type: 'VEHICLE',
          category: 'AUTÁ',
          description: 'Súhrnná hodnota vozového parku',
          currentValue: 53147,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Audi A3 (Krovina)',
          type: 'VEHICLE',
          category: 'AUTÁ',
          description: 'Audi A3 umiestnené v Krovine',
          currentValue: 15000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Ford Mustang',
          type: 'VEHICLE',
          category: 'AUTÁ',
          description: 'Ford Mustang',
          currentValue: 24000,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Nissan',
          type: 'VEHICLE',
          category: 'AUTÁ',
          description: 'Nissan vozidlo',
          currentValue: 11435,
        },
      }),
      prisma.asset.create({
        data: {
          name: 'Sivý Superb',
          type: 'VEHICLE',
          category: 'AUTÁ',
          description: 'Škoda Superb sivej farby',
          currentValue: 2712,
        },
      }),
    ]);

    // Legacy assets for compatibility
    const realEstateAsset = realEstateAssets[0]; // Use first real estate asset
    const loanAsset = loanAssets[0]; // Use first loan asset
    const stockAsset = stockAssets[0]; // Use stock asset

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
        // Pôvodné úvery
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
        // Úvery našej firmy
        {
          name: 'Pôžička Andrej',
          description: 'Pôžička od Andreja',
          currentBalance: 44498,
          interestRate: null,
        },
        {
          name: 'Pôžička Lajda',
          description: 'Pôžička od Lajdu',
          currentBalance: 50900,
          interestRate: null,
        },
        {
          name: 'Pôžička Kamil',
          description: 'Pôžička od Kamila',
          currentBalance: 100000,
          interestRate: null,
        },
        {
          name: 'Pôžička Filip',
          description: 'Pôžička od Filipa',
          currentBalance: 44800,
          interestRate: null,
        },
        {
          name: 'Pôžička Vlado Dúžek',
          description: 'Pôžička od Vlada Dúžka',
          currentBalance: 43000,
          interestRate: null,
        },
        {
          name: 'Pôžička Patrik Pavlík',
          description: 'Pôžička od Patrika Pavlíka',
          currentBalance: 20300,
          interestRate: null,
        },
        {
          name: 'BPT Ružinov',
          description: 'Úver BPT Ružinov',
          currentBalance: 88289,
          interestRate: null,
        },
        {
          name: 'Splátkový 3ple digit',
          description: 'Splátkový úver 3ple digit',
          currentBalance: 26000,
          interestRate: null,
        },
        {
          name: 'splátkový Logik Park',
          description: 'Splátkový úver Logik Park',
          currentBalance: 12500,
          interestRate: null,
        },
      ],
    });

    // Create bank balances
    log.info('🏦 Creating bank balances...');

    await prisma.bankBalance.createMany({
      data: [
        // Pôvodné účty
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
        // Nové bankové účty
        {
          accountName: '3ple Digit Bankový účet',
          bankName: '3ple Digit Bank',
          accountType: 'Current',
          amount: 37000,
          currency: 'EUR',
          date: new Date('2024-04-30'),
        },
        {
          accountName: 'p2 invest bankový účet',
          bankName: 'p2 invest',
          accountType: 'Current',
          amount: 3600,
          currency: 'EUR',
          date: new Date('2024-04-30'),
        },
        {
          accountName: 'poriaci účet p2',
          bankName: 'p2',
          accountType: 'Savings',
          amount: 630,
          currency: 'EUR',
          date: new Date('2024-04-30'),
        },
        {
          accountName: 'Rezervný fond',
          bankName: 'Reserve Bank',
          accountType: 'Savings',
          amount: 25000,
          currency: 'EUR',
          date: new Date('2024-04-30'),
        },
        {
          accountName: '3ple Digit Hotovosť',
          bankName: '3ple Digit',
          accountType: 'Cash',
          amount: 0,
          currency: 'EUR',
          date: new Date('2024-04-30'),
        },
      ],
    });

    // Create period snapshot
    log.info('📊 Creating period snapshot...');

    // Calculate total asset values
    const totalLoansValue =
      69700 +
      54060 +
      188559 +
      10000 +
      27680 +
      188086 +
      22520 +
      21000 +
      18500 +
      23600 +
      52000 +
      5000 +
      61109 +
      51900 +
      52000 +
      20000; // 865,714
    const totalRealEstateValue =
      120000 + 544395 + 53102 + 52650 + 133171 + 32500 + 35000 + 160000 + 11285 + 82690; // 1,224,793
    const totalMaterialValue = 3500 + 8000; // 11,500
    const totalStockValue = 7000; // 7,000
    const totalCompanyShareValue = 7850; // 7,850
    const totalVehicleValue = 53147 + 15000 + 24000 + 11435 + 2712; // 106,294
    const totalAssetValue =
      totalLoansValue +
      totalRealEstateValue +
      totalMaterialValue +
      totalStockValue +
      totalCompanyShareValue +
      totalVehicleValue; // 2,223,001

    // Calculate new totals with added accounts and loans
    const totalNewBankBalance = 125000 + 75000 + 25000 + 37000 + 3600 + 630 + 25000 + 0; // 291,230 EUR
    const totalNewLiabilities =
      200000 + 50000 + 44498 + 50900 + 100000 + 44800 + 43000 + 20300 + 88289 + 26000 + 12500; // 680,287 EUR

    const snapshot = await prisma.periodSnapshot.create({
      data: {
        date: new Date('2024-04-30'),
        totalAssetValue, // Sum of all assets (2,223,001)
        totalBankBalance: totalNewBankBalance, // Sum of all bank balances (291,230)
        totalLiabilities: totalNewLiabilities, // Sum of all liabilities (680,287)
        nav: totalAssetValue + totalNewBankBalance - totalNewLiabilities, // NAV = assets + bank - liabilities
        performanceFeeRate: 0.2, // 20% performance fee
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
  .catch(e => {
    log.error('❌ Database seed failed:', { error: e instanceof Error ? e.message : String(e) });
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

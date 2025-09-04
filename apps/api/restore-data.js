const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function restoreData() {
  console.log('🔄 Restoring data from backup...');

  try {
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync('export-2025-09-03T19-46-38-478Z.json', 'utf8'));

    console.log('📊 Backup contains:', {
      users: backupData.users?.length || 0,
      assets: backupData.assets?.length || 0,
      investors: backupData.investors?.length || 0,
    });

    // Create users first
    console.log('👥 Creating users...');
    for (const user of backupData.users || []) {
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            password: '$2b$10$defaulthashedpassword123456789', // Default hashed password
            createdAt: new Date(user.createdAt),
          },
        });
        console.log(`  ✅ Created user: ${user.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️  User ${user.name} already exists, skipping`);
        } else {
          console.error(`  ❌ Error creating user ${user.name}:`, error.message);
        }
      }
    }

    // Create investors
    console.log('💼 Creating investors...');
    for (const investor of backupData.investors || []) {
      try {
        const user = backupData.users.find(u => u.email === investor.email);
        if (user) {
          await prisma.investor.create({
            data: {
              id: investor.id,
              userId: user.id,
              name: investor.name,
              email: investor.email,
              phone: investor.phone || null,
            },
          });
          console.log(`  ✅ Created investor: ${investor.name}`);
        }
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️  Investor ${investor.name} already exists, skipping`);
        } else {
          console.error(`  ❌ Error creating investor ${investor.name}:`, error.message);
        }
      }
    }

    // Create assets
    console.log('🏢 Creating assets...');
    for (const asset of backupData.assets || []) {
      try {
        await prisma.asset.create({
          data: {
            id: asset.id,
            name: asset.name,
            type: asset.type.toLowerCase(), // Convert to lowercase for schema
            currentValue: asset.currentValue,
            status: asset.status || 'ACTIVE',
            acquiredPrice: asset.currentValue, // Default to current value
          },
        });
        console.log(`  ✅ Created asset: ${asset.name} (€${asset.currentValue.toLocaleString()})`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️  Asset ${asset.name} already exists, skipping`);
        } else {
          console.error(`  ❌ Error creating asset ${asset.name}:`, error.message);
        }
      }
    }

    console.log('✅ Data restore completed!');

    // Verify restored data
    const counts = {
      users: await prisma.user.count(),
      investors: await prisma.investor.count(),
      assets: await prisma.asset.count(),
    };

    console.log('📊 Current database counts:', counts);
  } catch (error) {
    console.error('❌ Restore failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();

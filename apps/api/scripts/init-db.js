// Database initialization script for Railway
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');

async function initializeDatabase() {
  console.log('🚀 Initializing database...');

  try {
    // Create database schema
    console.log('📊 Creating database schema...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

    const prisma = new PrismaClient();

    // Check if database is empty
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('📦 Database is empty, restoring from backup...');

      // Create admin user
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash('Admin123!@#', 10);

      const admin = await prisma.user.create({
        data: {
          email: 'admin@3pledigit.sk',
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log('✅ Admin user created:', admin.email);

      // Create sample investors if needed
      const sampleInvestors = [
        { email: 'investor1@example.com', name: 'Peter Novák' },
        { email: 'investor2@example.com', name: 'Jana Kováčová' },
        { email: 'investor3@example.com', name: 'Martin Horváth' },
      ];

      for (const investor of sampleInvestors) {
        const hashedPwd = await bcrypt.hash('Investor123', 10);
        const user = await prisma.user.create({
          data: {
            email: investor.email,
            name: investor.name,
            password: hashedPwd,
            role: 'INVESTOR',
          },
        });

        await prisma.investor.create({
          data: {
            userId: user.id,
            name: investor.name,
            email: investor.email,
          },
        });

        console.log('✅ Created investor:', investor.name);
      }
    } else {
      console.log('✅ Database already has data, skipping initialization');
    }

    await prisma.$disconnect();
    console.log('✅ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't exit with error - let the app start anyway
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };

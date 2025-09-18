#!/bin/bash
# Railway initialization script

echo "🚀 Railway Backend Initialization"

# Create database schema
echo "📊 Creating database schema..."
npx prisma db push --accept-data-loss

# Create admin user
echo "👤 Creating admin user..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@3pledigit.sk' },
      update: { role: 'ADMIN' },
      create: {
        email: 'admin@3pledigit.sk',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user ready:', admin.email);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"

# Start the application
echo "🎯 Starting application..."
npm start

// Simple admin seeder for Railway
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
    
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@3pledigit.sk' }
    });

    if (existing) {
      console.log('✅ Admin already exists');
      return;
    }

    const admin = await prisma.user.create({
      data: {
        email: 'admin@3pledigit.sk',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin created:', admin.email);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();

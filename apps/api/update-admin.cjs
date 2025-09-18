// Update admin password
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    console.log('🔐 Updating admin password...');
    
    const hashedPassword = await bcrypt.hash('Black123', 10);
    
    const admin = await prisma.user.update({
      where: { email: 'admin@3pledigit.sk' },
      data: {
        name: 'admin',
        password: hashedPassword
      }
    });

    console.log('✅ Admin updated:', admin.email);
    console.log('✅ New name:', admin.name);
    console.log('✅ Password changed to: Black123');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();

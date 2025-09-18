// Reset admin user with new credentials
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    console.log('🔐 Resetting admin user...');
    
    const newEmail = 'admin@3pledigit.com';
    const newPassword = 'Black123';
    const newName = 'Admin User';
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingAdmin) {
      console.log('📝 Updating existing admin user...');
      
      const updatedAdmin = await prisma.user.update({
        where: { email: newEmail },
        data: {
          name: newName,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      console.log('✅ Admin updated successfully!');
      console.log('📧 Email:', updatedAdmin.email);
      console.log('👤 Name:', updatedAdmin.name);
      console.log('🔑 Password:', newPassword);
      console.log('👑 Role:', updatedAdmin.role);
      
    } else {
      console.log('🆕 Creating new admin user...');
      
      const newAdmin = await prisma.user.create({
        data: {
          email: newEmail,
          name: newName,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      console.log('✅ Admin created successfully!');
      console.log('📧 Email:', newAdmin.email);
      console.log('👤 Name:', newAdmin.name);
      console.log('🔑 Password:', newPassword);
      console.log('👑 Role:', newAdmin.role);
    }
    
    console.log('\n🎉 Admin reset completed!');
    console.log('You can now login with:');
    console.log(`Email: ${newEmail}`);
    console.log(`Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error resetting admin:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();

// Reset admin script - can be run via API endpoint
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function resetAdmin() {
  try {
    console.log('🔐 Resetting admin user...');

    const newEmail = 'admin@3pledigit.com';
    const newPassword = 'Black123';
    const newName = 'Admin User';

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingAdmin) {
      console.log('📝 Updating existing admin user...');

      const updatedAdmin = await prisma.user.update({
        where: { email: newEmail },
        data: {
          name: newName,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log('✅ Admin updated successfully!');
      console.log('📧 Email:', updatedAdmin.email);
      console.log('👤 Name:', updatedAdmin.name);
      console.log('🔑 Password:', newPassword);
      console.log('👑 Role:', updatedAdmin.role);

      return {
        success: true,
        action: 'updated',
        admin: {
          email: updatedAdmin.email,
          name: updatedAdmin.name,
          role: updatedAdmin.role,
        },
      };
    } else {
      console.log('🆕 Creating new admin user...');

      const newAdmin = await prisma.user.create({
        data: {
          email: newEmail,
          name: newName,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log('✅ Admin created successfully!');
      console.log('📧 Email:', newAdmin.email);
      console.log('👤 Name:', newAdmin.name);
      console.log('🔑 Password:', newPassword);
      console.log('👑 Role:', newAdmin.role);

      return {
        success: true,
        action: 'created',
        admin: {
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
        },
      };
    }
  } catch (error) {
    console.error('❌ Error resetting admin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly
if (require.main === module) {
  resetAdmin().then(result => {
    console.log('\n🎉 Admin reset completed!');
    console.log('Result:', result);
    process.exit(result.success ? 0 : 1);
  });
}

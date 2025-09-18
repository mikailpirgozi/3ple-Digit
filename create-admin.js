// Skript na vytvorenie admin účtu
const bcrypt = require('bcrypt');

async function createAdmin() {
  // Railway DATABASE_URL - potrebujeme EXTERNÝ (nie internal)
  const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

  if (!DATABASE_URL || DATABASE_URL.includes('internal')) {
    console.error('❌ Potrebujem EXTERNÝ DATABASE_URL z Railway Postgres service!');
    console.error('   Použitie: node create-admin.js "postgresql://..."');
    process.exit(1);
  }

  // Nastavíme DATABASE_URL pre Prisma
  process.env.DATABASE_URL = DATABASE_URL;

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    console.log('🔗 Pripájam sa k databáze...');

    // Test pripojenia
    await prisma.$connect();
    console.log('✅ Pripojenie úspešné');

    // Vytvoríme admin účet
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@3pledigit.sk' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@3pledigit.sk',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin účet pripravený!');
    console.log('   Email: admin@3pledigit.sk');
    console.log('   Heslo: Admin123!@#');
  } catch (error) {
    console.error('❌ Chyba:', error.message);
    if (error.message.includes('P2002')) {
      console.log('ℹ️  Admin už existuje, skúste sa prihlásiť');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

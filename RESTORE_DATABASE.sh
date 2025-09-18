#!/bin/bash

# Railway Database Restore Script
# Použite tento skript po vytvorení novej databázy na Railway

echo "🔄 Railway Database Restore Tool"
echo "================================"

# Kontrola či máme DATABASE_URL
if [ -z "$1" ]; then
    echo "❌ Použitie: ./RESTORE_DATABASE.sh 'postgresql://...' "
    echo ""
    echo "1. Vytvorte novú PostgreSQL databázu na Railway"
    echo "2. Skopírujte DATABASE_URL z Railway dashboard"
    echo "3. Spustite: ./RESTORE_DATABASE.sh 'DATABASE_URL'"
    exit 1
fi

NEW_DATABASE_URL=$1
cd apps/api

echo "📝 Aktualizujem .env súbor..."
# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update DATABASE_URL
if grep -q "^DATABASE_URL=" .env; then
    # Replace existing DATABASE_URL
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" .env
else
    # Add DATABASE_URL if not exists
    echo "DATABASE_URL=\"$NEW_DATABASE_URL\"" >> .env
fi

echo "✅ .env aktualizovaný"

echo "🏗️  Vytvárам databázové schémy..."
npx prisma db push --skip-generate

echo "🌱 Vytvárám admin používateľa..."
cat > temp-seed.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@3pledigit.sk',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('✅ Admin vytvorený:', admin.email);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Admin už existuje');
    } else {
      console.error('❌ Chyba:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
EOF

node temp-seed.js
rm temp-seed.js

echo ""
echo "🎉 HOTOVO!"
echo "========="
echo "✅ Databáza je pripravená"
echo "✅ Admin účet vytvorený:"
echo "   Email: admin@3pledigit.sk"
echo "   Heslo: Admin123!@#"
echo ""
echo "📱 Teraz môžete:"
echo "1. Počkať na Railway redeploy (1-2 min)"
echo "2. Prihlásiť sa na stránku"
echo ""
echo "💾 Ak potrebujete obnoviť dáta zo zálohy:"
echo "   psql '$NEW_DATABASE_URL' < backups/enhanced-backup-2025-09-18T15-01-07-956Z.sql"

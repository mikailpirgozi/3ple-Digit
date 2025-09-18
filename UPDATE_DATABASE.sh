#!/bin/bash

echo "🔄 Railway Database Update Tool"
echo "================================"
echo ""
echo "📋 INŠTRUKCIE:"
echo "1. V Railway kliknite na Postgres service"
echo "2. Choďte do Variables tab"
echo "3. Skopírujte DATABASE_URL"
echo "4. Vložte sem:"
echo ""

read -p "Vložte nový DATABASE_URL: " NEW_URL

if [ -z "$NEW_URL" ]; then
    echo "❌ DATABASE_URL nemôže byť prázdny!"
    exit 1
fi

cd apps/api

echo ""
echo "📝 Aktualizujem lokálny .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
if grep -q "^DATABASE_URL=" .env; then
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_URL\"|" .env
else
    echo "DATABASE_URL=\"$NEW_URL\"" >> .env
fi

echo "✅ .env aktualizovaný"
echo ""
echo "🔗 Testujem pripojenie..."
npx prisma db pull > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Pripojenie úspešné!"
    echo ""
    echo "🏗️ Aktualizujem databázovú schému..."
    npx prisma db push --skip-generate
    
    echo ""
    echo "🌱 Kontrolujem admin účet..."
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcrypt');
    const prisma = new PrismaClient();
    
    (async () => {
      try {
        const admin = await prisma.user.findUnique({
          where: { email: 'admin@3pledigit.sk' }
        });
        
        if (!admin) {
          const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
          await prisma.user.create({
            data: {
              email: 'admin@3pledigit.sk',
              name: 'Admin',
              password: hashedPassword,
              role: 'ADMIN',
            },
          });
          console.log('✅ Admin účet vytvorený');
        } else {
          console.log('✅ Admin účet už existuje');
        }
      } catch (error) {
        console.error('Chyba:', error.message);
      } finally {
        await prisma.\$disconnect();
      }
    })();
    "
    
    echo ""
    echo "🎉 HOTOVO!"
    echo "========="
    echo "✅ Databáza je aktualizovaná"
    echo "✅ Backend by sa mal redeployovať automaticky"
    echo ""
    echo "📱 Prihlasovacie údaje:"
    echo "   Email: admin@3pledigit.sk"
    echo "   Heslo: Admin123!@#"
else
    echo "❌ Nemôžem sa pripojiť k databáze!"
    echo "   Skontrolujte DATABASE_URL"
    echo "   Možno je databáza vypnutá alebo URL je nesprávne"
fi

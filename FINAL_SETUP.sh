#!/bin/bash

echo "🚀 3PLE DIGIT - Finálne nastavenie"
echo "==================================="
echo ""
echo "📋 Tento skript:"
echo "  1. Pripojí sa k Railway databáze"
echo "  2. Vytvorí schému"
echo "  3. Vytvorí admin účet"
echo ""
echo "🔗 Potrebujem EXTERNÝ DATABASE_URL z Railway Postgres"
echo "   (musí obsahovať proxy.rlwy.net, NIE railway.internal)"
echo ""
read -p "Vložte DATABASE_URL: " DB_URL

if [ -z "$DB_URL" ]; then
  echo "❌ DATABASE_URL nemôže byť prázdny!"
  exit 1
fi

if [[ "$DB_URL" == *"internal"* ]]; then
  echo "❌ Používate interný URL! Potrebujete EXTERNÝ (proxy.rlwy.net)!"
  exit 1
fi

cd apps/api

# Aktualizuj .env
echo "📝 Aktualizujem .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null
cat > .env << EOF
NODE_ENV=production
PORT=4000
DATABASE_URL="$DB_URL"
JWT_SECRET=321e7020952c02839c7803d9441393f8e20d81d9882c3cb5533bf6b9109903e4f455a43481c2c05fc04f098612095dc5e13daf0b079c1613eab85a98fb60e693
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,https://3ple-digit-qtqq.vercel.app,https://3ple-digit-qtqq-blackrents-projects.vercel.app
LOG_LEVEL=info
EOF

echo "✅ .env aktualizovaný"
echo ""
echo "🔗 Testujem pripojenie..."
npx prisma db pull > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Pripojenie úspešné!"
  echo ""
  echo "🏗️ Vytváram/aktualizujem schému..."
  npx prisma db push --skip-generate
  
  echo ""
  echo "👤 Vytváram admin účet..."
  node ../../create-admin.js "$DB_URL"
  
  echo ""
  echo "🎉 HOTOVO!"
  echo "========="
  echo ""
  echo "📱 Môžete sa prihlásiť na: https://3ple-digit-qtqq.vercel.app"
  echo "   Email: admin@3pledigit.sk"
  echo "   Heslo: Admin123!@#"
  echo ""
  echo "🚀 Backend API: https://backend-production-2bd2.up.railway.app"
  
else
  echo "❌ Nemôžem sa pripojiť k databáze!"
  echo "   Skontrolujte DATABASE_URL"
fi

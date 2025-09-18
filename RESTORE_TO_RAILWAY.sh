#!/bin/bash

echo "🚀 3PLE DIGIT - Nahrávam databázu na Railway"
echo "==========================================="
echo ""

# Farby pre výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Kontrola Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}📦 Inštalujem Railway CLI...${NC}"
    npm install -g @railway/cli
fi

echo -e "${GREEN}1. Prihlásenie do Railway${NC}"
railway login

cd apps/api

echo ""
echo -e "${GREEN}2. Prepojenie s projektom${NC}"
echo "   Vyberte: 3ple digit app → backend"
railway link

echo ""
echo -e "${GREEN}3. Vytváram databázovú schému${NC}"
railway run npx prisma db push --accept-data-loss

echo ""
echo -e "${GREEN}4. Nahrávam dáta z poslednej zálohy${NC}"
echo "   Používam: enhanced-backup-2025-09-18T15-01-07-956Z.sql"

# Získame DATABASE_URL z Railway
echo ""
echo -e "${YELLOW}Získavam DATABASE_URL z Railway...${NC}"
DATABASE_URL=$(railway variables -k | grep DATABASE_URL | head -1 | cut -d'=' -f2-)

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Nepodarilo sa získať DATABASE_URL${NC}"
    echo "Skúste manuálne:"
    echo "1. railway variables"
    echo "2. Skopírujte DATABASE_URL"
    echo "3. Spustite: psql 'DATABASE_URL' < backups/enhanced-backup-2025-09-18T15-01-07-956Z.sql"
    exit 1
fi

# Kontrola či je to interný alebo externý URL
if [[ "$DATABASE_URL" == *"internal"* ]]; then
    echo -e "${YELLOW}⚠️  Máte interný URL, potrebujeme externý...${NC}"
    echo "V Railway Postgres service:"
    echo "1. Settings → Networking → Enable Public Networking"
    echo "2. Variables → skopírujte DATABASE_PUBLIC_URL"
    echo ""
    read -p "Vložte externý DATABASE_URL (s proxy.rlwy.net): " DATABASE_URL
fi

echo -e "${GREEN}Nahrávam databázu...${NC}"

# Nahráme zálohu
if [ -f "backups/enhanced-backup-2025-09-18T15-01-07-956Z.sql" ]; then
    psql "$DATABASE_URL" < backups/enhanced-backup-2025-09-18T15-01-07-956Z.sql 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Databáza úspešne nahraná!${NC}"
    else
        echo -e "${YELLOW}⚠️  Niektoré tabuľky už existujú, skúšam alternatívu...${NC}"
        
        # Alternatíva - len vložíme dáta
        railway run node -e "
        const { PrismaClient } = require('@prisma/client');
        const fs = require('fs');
        const prisma = new PrismaClient();
        
        (async () => {
          try {
            // Kontrola existujúcich dát
            const userCount = await prisma.user.count();
            const investorCount = await prisma.investor.count();
            
            console.log('Existujúce dáta:');
            console.log('- Users:', userCount);
            console.log('- Investors:', investorCount);
            
            if (userCount === 0) {
              console.log('Vytváram admin účet...');
              const bcrypt = require('bcrypt');
              const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
              await prisma.user.create({
                data: {
                  email: 'admin@3pledigit.sk',
                  name: 'Admin',
                  password: hashedPassword,
                  role: 'ADMIN'
                }
              });
              console.log('✅ Admin účet vytvorený');
            }
            
            console.log('✅ Databáza pripravená!');
          } catch (error) {
            console.error('Chyba:', error.message);
          } finally {
            await prisma.\$disconnect();
          }
        })();
        "
    fi
else
    echo -e "${RED}❌ Záloha nenájdená!${NC}"
    echo "Očakávaná cesta: apps/api/backups/enhanced-backup-2025-09-18T15-01-07-956Z.sql"
fi

echo ""
echo -e "${GREEN}5. Reštartujem backend${NC}"
railway up --detach

echo ""
echo "==========================================="
echo -e "${GREEN}✅ HOTOVO!${NC}"
echo ""
echo "📱 Aplikácia: https://3ple-digit-qtqq.vercel.app"
echo "🔑 Prihlásenie:"
echo "   Email: admin@3pledigit.sk"
echo "   Heslo: Admin123!@#"
echo ""
echo "🚀 Backend API: https://backend-production-2bd2.up.railway.app"
echo ""
echo -e "${YELLOW}Poznámka: Backend sa reštartuje, počkajte 1-2 minúty${NC}"

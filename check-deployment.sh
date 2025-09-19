#!/bin/bash

echo "========================================="
echo "🔍 KONTROLA DEPLOYMENT NASTAVENÍ"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "1️⃣  KONTROLA VERCEL"
echo "-----------------"
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✓ Vercel CLI nainštalovaný${NC}"
    echo "Kontrolujem Vercel env premenné..."
    vercel env ls production 2>/dev/null | grep VITE_API_URL || echo -e "${YELLOW}⚠ VITE_API_URL nie je nastavené${NC}"
else
    echo -e "${RED}✗ Vercel CLI nie je nainštalovaný${NC}"
    echo "Nainštalujte: npm i -g vercel"
fi

echo ""
echo "2️⃣  KONTROLA RAILWAY"
echo "------------------"
if command -v railway &> /dev/null; then
    echo -e "${GREEN}✓ Railway CLI nainštalovaný${NC}"
    echo "Kontrolujem Railway premenné..."
    railway variables --service backend 2>/dev/null | grep -E "R2_|CORS_|DATABASE_URL" || echo -e "${YELLOW}⚠ Nemôžem skontrolovať Railway premenné${NC}"
else
    echo -e "${RED}✗ Railway CLI nie je nainštalovaný${NC}"
    echo "Nainštalujte: npm i -g @railway/cli"
fi

echo ""
echo "3️⃣  KONTROLA LOKÁLNYCH ENV"
echo "------------------------"
if [ -f "apps/api/.env" ]; then
    echo -e "${GREEN}✓ Backend .env súbor existuje${NC}"
    grep -E "R2_|DATABASE_URL|JWT_SECRET" apps/api/.env | sed 's/=.*/=***/' || echo -e "${YELLOW}⚠ Chýbajú R2 premenné${NC}"
else
    echo -e "${RED}✗ Backend .env súbor neexistuje${NC}"
fi

if [ -f "apps/web/.env.local" ]; then
    echo -e "${GREEN}✓ Frontend .env.local súbor existuje${NC}"
    grep "VITE_API_URL" apps/web/.env.local || echo -e "${YELLOW}⚠ VITE_API_URL nie je nastavené${NC}"
else
    echo -e "${RED}✗ Frontend .env.local súbor neexistuje${NC}"
fi

echo ""
echo "========================================="
echo "📋 SPRÁVNE CORS NASTAVENIA PRE R2"
echo "========================================="
echo ""
echo "V Cloudflare Dashboard → R2 → váš bucket → Settings → CORS Policy:"
echo ""
cat << 'EOF'
[
  {
    "AllowedOrigins": [
      "https://3ple-digit-qtqq.vercel.app",
      "https://3ple-digit-qtqq-blackrents-projects.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "HEAD",
      "DELETE",
      "OPTIONS"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3600
  }
]
EOF

echo ""
echo "========================================="
echo "🔧 RAILWAY PREMENNÉ (backend service)"
echo "========================================="
echo ""
echo "R2_ACCOUNT_ID=9ccdca0d876e24bd9acefabe56f94f53"
echo "R2_ACCESS_KEY_ID=b448155afb265f743934a8e85789d712"
echo "R2_SECRET_ACCESS_KEY=0a44d12d928751f610baedf57c276e79ca303f2e3529c95530f07595ee4f33af"
echo "R2_BUCKET_NAME=3ple-digit-documents-prod"
echo "R2_PUBLIC_URL=https://9ccdca0d876e24bd9acefabe56f94f53.r2.cloudflarestorage.com"
echo ""
echo "CORS_ORIGINS=http://localhost:3000,https://3ple-digit-qtqq.vercel.app,https://3ple-digit-qtqq-blackrents-projects.vercel.app"

echo ""
echo "========================================="
echo "🌐 VERCEL PREMENNÉ (web)"
echo "========================================="
echo ""
echo "VITE_API_URL=https://backend-production-2bd2.up.railway.app"

echo ""
echo "========================================="
echo "✅ KONTROLNÝ ZOZNAM"
echo "========================================="
echo ""
echo "[ ] 1. Railway backend má všetky R2 premenné"
echo "[ ] 2. Railway backend sa reštartoval po pridaní premenných"
echo "[ ] 3. Cloudflare R2 má správne CORS nastavenia"
echo "[ ] 4. CORS obsahuje OPTIONS metódu"
echo "[ ] 5. Vercel má správny VITE_API_URL"
echo "[ ] 6. Browser cache je vyčistený (skúste incognito)"
echo ""

#!/bin/bash

# 3PLE DIGIT - Automatic Server Startup Script
# Spúšťa backend a frontend servery s automatickým reštartovaním

echo "🚀 Spúšťam 3PLE DIGIT servery..."

# Vytvor logs priečinok ak neexistuje
mkdir -p logs

# Zastaviť existujúce procesy (ak bežia)
echo "🛑 Zastavujem existujúce procesy..."
pm2 delete 3ple-digit-api 2>/dev/null || true
pm2 delete 3ple-digit-web 2>/dev/null || true

# Spustiť servery cez PM2
echo "▶️  Spúšťam backend API server..."
pm2 start ecosystem.config.cjs --only 3ple-digit-api

echo "▶️  Spúšťam frontend web server..."
pm2 start ecosystem.config.cjs --only 3ple-digit-web

# Zobraziť status
echo "📊 Status serverov:"
pm2 status

echo ""
echo "✅ Servery sú spustené!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000"
echo ""
echo "📋 Užitočné príkazy:"
echo "   pm2 status          - zobraziť status"
echo "   pm2 logs            - zobraziť logy"
echo "   pm2 restart all     - reštartovať všetky"
echo "   pm2 stop all        - zastaviť všetky"
echo "   pm2 delete all      - zmazať všetky procesy"
echo ""
echo "🔄 Servery sa automaticky reštartujú len pri páde (nie pri reštarte systému)"

#!/bin/bash

# 3PLE DIGIT - Simple Server Startup Script
# Spúšťa backend a frontend servery bez PM2

echo "🚀 Spúšťam 3PLE DIGIT servery..."

# Vytvor logs priečinok ak neexistuje
mkdir -p logs

# Zastaviť existujúce procesy (ak bežia)
echo "🛑 Zastavujem existujúce procesy..."
./stop-servers.sh

# Spustiť backend server na pozadí
echo "▶️  Spúšťam backend API server..."
cd apps/api
nohup pnpm dev > ../../logs/api-out.log 2> ../../logs/api-error.log &
API_PID=$!
echo "Backend PID: $API_PID"
cd ../..

# Spustiť frontend server na pozadí
echo "▶️  Spúšťam frontend web server..."
cd apps/web
nohup pnpm dev > ../../logs/web-out.log 2> ../../logs/web-error.log &
WEB_PID=$!
echo "Frontend PID: $WEB_PID"
cd ../..

# Počkať chvíľu na spustenie
sleep 3

echo ""
echo "✅ Servery sú spustené!"
echo "🌐 Frontend: http://localhost:3000 (PID: $WEB_PID)"
echo "🔧 Backend API: http://localhost:4000 (PID: $API_PID)"
echo ""
echo "📋 Užitočné príkazy:"
echo "   ./stop-servers.sh   - zastaviť servery"
echo "   tail -f logs/api-out.log    - sledovať API logy"
echo "   tail -f logs/web-out.log    - sledovať web logy"
echo "   lsof -i :3000       - skontrolovať port 3000"
echo "   lsof -i :4000       - skontrolovať port 4000"
echo ""
echo "⚠️  Servery sa už nerestartujú automaticky - použite Ctrl+C na ukončenie"

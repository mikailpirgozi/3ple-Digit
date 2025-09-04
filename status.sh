#!/bin/bash

# 3PLE DIGIT - Quick Status Check
echo "📊 3PLE DIGIT Server Status"
echo "=========================="

# PM2 status
pm2 status

echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"

echo ""
echo "📋 Quick Commands:"
echo "   ./start-servers.sh  - spustiť servery"
echo "   ./stop-servers.sh   - zastaviť servery"
echo "   pm2 logs           - zobraziť logy"
echo "   pm2 monit          - monitoring dashboard"

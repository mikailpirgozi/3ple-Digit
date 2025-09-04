#!/bin/bash

# 3PLE DIGIT - Stop Servers Script
# Zastaví všetky servery

echo "🛑 Zastavujem 3PLE DIGIT servery..."

# Zastaviť všetky procesy
pm2 stop all

# Zobraziť status
echo "📊 Status serverov:"
pm2 status

echo ""
echo "✅ Servery boli zastavené!"
echo ""
echo "💡 Pre úplné odstránenie procesov použite: pm2 delete all"

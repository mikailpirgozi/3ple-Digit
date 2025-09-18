#!/bin/bash

# 3PLE DIGIT - Stop Servers Script
# Zastaví všetky servery

echo "🛑 Zastavujem 3PLE DIGIT servery..."

# Zastaviť procesy na portoch 3000 a 4000
echo "Ukončujem procesy na porte 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Žiadny proces na porte 3000"

echo "Ukončujem procesy na porte 4000..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || echo "Žiadny proces na porte 4000"

# Zastaviť všetky node procesy s názvom obsahujúcim "3ple digit aplikacia"
pkill -f "3ple digit aplikacia" 2>/dev/null || echo "Žiadne ďalšie procesy"

echo ""
echo "✅ Servery boli zastavené!"
echo ""
echo "💡 Servery teraz používajú štandardné Node.js procesy namiesto PM2"

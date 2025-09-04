#!/bin/bash

# 🛡️ BEZPEČNÝ RAILWAY DEPLOYMENT SKRIPT
# Automaticky vytvorí zálohu pred migráciami

set -e  # Exit on any error

echo "🚀 Starting safe Railway deployment..."

# 1. Vytvorenie zálohy
echo "📦 Creating database backup..."
BACKUP_FILE="emergency-backup-$(date +%Y%m%d-%H%M%S).json"

railway run pnpm db:backup-full "$BACKUP_FILE" || {
    echo "❌ Backup failed! Aborting deployment."
    exit 1
}

echo "✅ Backup created: $BACKUP_FILE"

# 2. Spustenie migrácií
echo "🔄 Running database migrations..."
railway run pnpm db:deploy || {
    echo "❌ Migration failed!"
    echo "🔧 To restore from backup, run:"
    echo "   railway run pnpm db:restore $BACKUP_FILE"
    exit 1
}

echo "✅ Migrations completed successfully"

# 3. Overenie stavu databázy
echo "🔍 Verifying database state..."
railway run psql -c "SELECT COUNT(*) as users FROM users;" || {
    echo "⚠️  Database verification failed"
    echo "🔧 Consider restoring from backup if needed"
}

echo "🎉 Safe deployment completed!"
echo "📋 Backup file: $BACKUP_FILE"
echo "🔧 To restore if needed: railway run pnpm db:restore $BACKUP_FILE"

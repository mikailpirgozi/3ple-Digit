#!/bin/bash

# Railway database backup script
echo "🔄 Starting Railway backup..."

# Get timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="railway-backup-${TIMESTAMP}.sql"
BACKUP_DIR="./backups"

# Create backup directory
mkdir -p "$BACKUP_DIR"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

echo "💾 Creating backup via Railway..."

# Use Railway CLI to create backup
railway run 'pg_dump $DATABASE_URL --data-only --inserts' > "$BACKUP_PATH"

if [ $? -eq 0 ] && [ -s "$BACKUP_PATH" ]; then
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    
    echo "✅ Backup completed successfully!"
    echo "📁 File: $BACKUP_FILE"
    echo "💾 Size: $FILE_SIZE"
    echo "📍 Path: $BACKUP_PATH"
    
    # Count records (approximate)
    RECORD_COUNT=$(grep -c "INSERT INTO" "$BACKUP_PATH" 2>/dev/null || echo "unknown")
    echo "📊 Approximate records: $RECORD_COUNT"
    
    # Show first few lines to verify
    echo ""
    echo "📋 Backup preview:"
    head -10 "$BACKUP_PATH"
else
    echo "❌ Backup failed or empty!"
    rm -f "$BACKUP_PATH"
    exit 1
fi

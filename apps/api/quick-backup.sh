#!/bin/bash

# Quick database backup script
echo "🔄 Starting quick backup..."

# Get timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="backup-${TIMESTAMP}.sql"
BACKUP_DIR="./backups"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get DATABASE_URL from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env file"
    exit 1
fi

# Extract connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL_REGEX="postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)"

if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Could not parse DATABASE_URL"
    exit 1
fi

echo "📊 Database: $DB_NAME on $DB_HOST:$DB_PORT"

# Create SQL dump
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

echo "💾 Creating backup..."
PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --data-only \
    --inserts \
    -f "$BACKUP_PATH"

if [ $? -eq 0 ]; then
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    
    echo "✅ Backup completed successfully!"
    echo "📁 File: $BACKUP_FILE"
    echo "💾 Size: $FILE_SIZE"
    echo "📍 Path: $BACKUP_PATH"
    
    # Count records (approximate)
    RECORD_COUNT=$(grep -c "INSERT INTO" "$BACKUP_PATH" 2>/dev/null || echo "unknown")
    echo "📊 Approximate records: $RECORD_COUNT"
else
    echo "❌ Backup failed!"
    exit 1
fi

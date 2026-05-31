#!/usr/bin/env bash
# AgencyOS database backup script
# Usage: ./scripts/backup.sh [destination_dir]
# Cron (daily at 2am): 0 2 * * * /app/scripts/backup.sh /backups

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_URL="${DATABASE_URL:-file:./dev.db}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

echo "[backup] Starting backup at $TIMESTAMP"

# SQLite backup
if [[ "$DB_URL" == file:* ]]; then
  DB_PATH="${DB_URL#file:}"
  DEST="$BACKUP_DIR/agencyos_sqlite_$TIMESTAMP.db"
  # SQLite online backup using sqlite3 .backup command
  if command -v sqlite3 &>/dev/null; then
    sqlite3 "$DB_PATH" ".backup '$DEST'"
    gzip "$DEST"
    echo "[backup] SQLite backup: $DEST.gz"
  else
    cp "$DB_PATH" "$DEST"
    gzip "$DEST"
    echo "[backup] SQLite copy (sqlite3 not found): $DEST.gz"
  fi
fi

# PostgreSQL backup (when DATABASE_URL is postgres://)
if [[ "$DB_URL" == postgres* ]]; then
  DEST="$BACKUP_DIR/agencyos_pg_$TIMESTAMP.sql.gz"
  pg_dump "$DB_URL" | gzip > "$DEST"
  echo "[backup] PostgreSQL backup: $DEST"
fi

# Upload files backup (if local storage)
UPLOAD_DIR="${LOCAL_UPLOAD_DIR:-./uploads}"
if [[ -d "$UPLOAD_DIR" ]]; then
  UPLOADS_DEST="$BACKUP_DIR/agencyos_uploads_$TIMESTAMP.tar.gz"
  tar -czf "$UPLOADS_DEST" -C "$UPLOAD_DIR" .
  echo "[backup] Uploads backup: $UPLOADS_DEST"
fi

# Prune old backups
find "$BACKUP_DIR" -name "agencyos_*" -mtime +"$RETENTION_DAYS" -delete
echo "[backup] Pruned backups older than $RETENTION_DAYS days"

echo "[backup] Completed at $(date +"%Y%m%d_%H%M%S")"

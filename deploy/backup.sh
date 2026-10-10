#!/usr/bin/env bash
# Sauvegarde de la base et des fichiers envoyés. Conserve 30 jours.
# Cron quotidien (crontab -e) :  30 3 * * * /opt/alsimat/deploy/backup.sh >> /var/log/alsimat-backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
STAMP=$(date +%Y-%m-%d_%H%M)
docker compose exec -T db pg_dump -U alsimat -d alsimat --no-owner | gzip > "backups/db_$STAMP.sql.gz"
tar -czf "backups/uploads_$STAMP.tar.gz" uploads
find backups -type f -mtime +30 -delete
echo "✓ Sauvegarde $STAMP ($(du -sh backups | cut -f1) au total)"

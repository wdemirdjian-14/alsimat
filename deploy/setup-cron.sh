#!/usr/bin/env bash
# Installe les tâches programmées d'Alsimat (idempotent) :
#  - envoi des campagnes e-mail, chaque minute
#  - sauvegarde de la base, chaque nuit à 3h30
set -euo pipefail
cd "$(dirname "$0")/.."
grep -q '^CRON_SECRET=.\+' .env || { sed -i '/^CRON_SECRET=/d' .env; echo "CRON_SECRET=$(openssl rand -hex 24)" >> .env; docker compose up -d app; }
SECRET=$(grep -E '^CRON_SECRET=' .env | cut -d= -f2-)
PORT=$(grep -E '^APP_PORT=' .env | cut -d= -f2); PORT=${PORT:-3010}
DIR=$(pwd)
( crontab -l 2>/dev/null | grep -v 'alsimat-campaigns' | grep -v '/opt/alsimat/deploy/backup.sh' ;
  echo "* * * * * curl -fsS -m 55 -H 'Authorization: Bearer $SECRET' http://127.0.0.1:$PORT/api/cron/campaigns >/dev/null 2>&1 # alsimat-campaigns"
  echo "30 3 * * * $DIR/deploy/backup.sh >> $HOME/alsimat-backup.log 2>&1"
) | crontab -
echo "✓ Tâches programmées installées :"; crontab -l | grep -E 'alsimat'

#!/usr/bin/env bash
# Mise à jour du site après un push sur GitHub (branche main).
set -euo pipefail
cd "$(dirname "$0")/.."
./deploy/backup.sh
git pull --ff-only
docker compose build
docker compose run --rm tools npx prisma db push --skip-generate
docker compose up -d app
docker image prune -f >/dev/null
echo "✓ Site mis à jour"

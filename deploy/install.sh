#!/usr/bin/env bash
# Première installation d'Alsimat sur le VPS. À lancer depuis /opt/alsimat après le git clone.
set -euo pipefail
cd "$(dirname "$0")/.."

command -v docker >/dev/null || { echo "Docker n'est pas installé : https://docs.docker.com/engine/install/"; exit 1; }
[ -f .env ] || { cp .env.example .env; echo "→ Fichier .env créé : complétez-le (POSTGRES_PASSWORD, AUTH_SECRET, SMTP…) puis relancez ce script."; exit 1; }
grep -q '^POSTGRES_PASSWORD=.\+' .env || { echo "POSTGRES_PASSWORD manquant dans .env"; exit 1; }
grep -q '^AUTH_SECRET=.\{32,\}' .env || { echo "AUTH_SECRET manquant ou trop court dans .env"; exit 1; }

PORT=$(grep -E '^APP_PORT=' .env | cut -d= -f2); PORT=${PORT:-3010}
if command -v ss >/dev/null && ss -ltn | grep -q ":$PORT "; then echo "Le port $PORT est déjà utilisé : choisissez un autre APP_PORT dans .env (et dans la conf Nginx)."; exit 1; fi

mkdir -p uploads/public uploads/private backups
# Le conteneur tourne avec l'utilisateur 1001 : il doit pouvoir écrire dans uploads/
if [ "$(id -u)" -eq 0 ]; then chown -R 1001:1001 uploads; else sudo chown -R 1001:1001 uploads; fi

echo "→ Construction des images…"
docker compose --profile tools build
docker compose up -d db
echo "→ Création des tables…"
docker compose run --rm tools npx prisma db push --skip-generate
echo "→ Import du catalogue d'origine (54 fiches, 7 gammes)…"
docker compose run --rm tools npx tsx scripts/import-legacy.ts
docker compose run --rm tools npx tsx scripts/apply-showcase.ts
echo "→ Démarrage du site…"
docker compose up -d app
sleep 5
curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" && echo "✓ Site démarré sur 127.0.0.1:$PORT"
echo
echo "Étapes suivantes :"
echo "  1. Créer votre compte admin :"
echo "     docker compose run --rm -e ADMIN_EMAIL=vous@alsimat.fr -e ADMIN_PASSWORD='MotDePasseLong!' tools npx tsx scripts/create-admin.ts"
echo "  2. Configurer Nginx : cp deploy/nginx-alsimat.conf /etc/nginx/sites-available/alsimat.conf (voir README)"

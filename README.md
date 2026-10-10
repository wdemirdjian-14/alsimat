# Alsimat — site web (v2)

Site vitrine et catalogue d'**Alsimat**, spécialiste de la golfette électrique, reconstruit à partir de la sauvegarde de l'ancien site (branche `sauvegarde-origine`).

- **Next.js 15** (App Router, React 19, TypeScript) · **Tailwind CSS 4**
- **PostgreSQL** + **Prisma** · images optimisées automatiquement (WebP/AVIF)
- **Admin** intégré sur `/admin` : véhicules, gammes, occasion, promotions, réalisations, conseils (blog), contenus, demandes
- Formulaires **devis / contact / SAV** enregistrés en base + **notification e-mail** (SMTP IONOS)
- Déploiement **Docker** isolé, derrière le Nginx déjà présent sur le VPS

---

## Ce qui a changé par rapport à l'ancien site

| Sujet | Avant | Maintenant |
|---|---|---|
| Positionnement Google | « tracteurs et nacelles électriques » (obsolète) | « golfette électrique » + gammes, sur chaque page |
| Titres / descriptions | identiques partout | uniques par page, générés depuis les données (places, autonomie, prix) |
| Données structurées | aucune | Entreprise, Produit + prix, Fil d'Ariane, FAQ, Article, Liste |
| Images | 130 Mo de PNG hébergés chez l'ancienne plateforme | 11 Mo de WebP locaux, noms de fichiers descriptifs, AVIF à la volée |
| Anciennes URL | — | conservées à l'identique ; URL erronées / fiches de démo redirigées (301) |
| Pied de page | liens vers des gammes inexistantes | généré depuis le catalogue |
| Catalogue | liste simple | filtres (places, homologation, transport de matériel) + tri prix/autonomie |
| Formulaires | enregistrés sans notification | e-mail à l'équipe + accusé de réception au client, anti-spam |
| SAV | pièces jointes publiques sur S3 | stockées en privé, lisibles uniquement depuis l'admin |
| Blog | un article rangé dans « Réalisations » | rubrique **Conseils** dédiée |
| Mobile | — | barre « Appeler / Devis gratuit » toujours visible |

Contenus repris : 46 véhicules en ligne, 7 gammes, l'article de conseils. Masqués (à vérifier dans l'admin) : 8 fiches de démonstration de l'ancien modèle (tracteur, nacelles, tricycle…) et 3 réalisations au texte générique.

---

## Déploiement sur le VPS IONOS

Prérequis : Docker (+ plugin compose), Nginx et Certbot. L'application n'écoute que sur `127.0.0.1` et ne touche à aucun autre site.

### 1. Installer le site

```bash
sudo mkdir -p /opt/alsimat && sudo chown $USER /opt/alsimat
git clone https://github.com/wdemirdjian-14/alsimat.git /opt/alsimat
cd /opt/alsimat
./deploy/install.sh          # crée .env au premier lancement
nano .env                    # POSTGRES_PASSWORD, AUTH_SECRET, SMTP… (voir les commentaires)
./deploy/install.sh          # construit, crée la base, importe le catalogue, démarre
```

Créer votre compte administrateur :

```bash
docker compose run --rm -e ADMIN_EMAIL=vous@alsimat.fr -e ADMIN_PASSWORD='UnMotDePasseLong!' tools npx tsx scripts/create-admin.ts
```

> Les anciens comptes admin ne sont pas repris : chaque administrateur est recréé avec un mot de passe neuf.

### 2. Brancher Nginx et le HTTPS

```bash
sudo cp deploy/nginx-alsimat.conf /etc/nginx/sites-available/alsimat.conf
sudo ln -s /etc/nginx/sites-available/alsimat.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Pointer le domaine (espace client IONOS → Domaines → alsimat.com → DNS)

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | adresse IPv4 du VPS |
| A | `www` | adresse IPv4 du VPS |
| AAAA | `@` et `www` | IPv6 du VPS (ou supprimer les AAAA existants) |

Une fois la propagation faite (`dig +short alsimat.com`), activer le HTTPS :

```bash
sudo certbot --nginx -d alsimat.com -d www.alsimat.com --redirect
```

### 4. Sauvegardes automatiques

```bash
crontab -e
# ajouter :
30 3 * * * /opt/alsimat/deploy/backup.sh >> /var/log/alsimat-backup.log 2>&1
```

Base + fichiers envoyés, conservés 30 jours dans `/opt/alsimat/backups` (pensez à les copier ailleurs de temps en temps).

### Mettre à jour le site

```bash
cd /opt/alsimat && ./deploy/update.sh     # sauvegarde, git pull, rebuild, redémarrage
```

---

## Après la mise en ligne — référencement

1. **Admin → Paramètres → Entreprise** : renseigner l'adresse complète, le SIRET, le directeur de publication, les réseaux sociaux. L'adresse est capitale pour le référencement local et alimente les mentions légales.
2. **Google Search Console** (search.google.com/search-console) : ajouter la propriété `alsimat.com` (validation DNS chez IONOS), puis soumettre `https://alsimat.com/sitemap.xml`.
3. **Google Business Profile** : créer/mettre à jour la fiche Alsimat avec le lien vers le site.
4. **Admin → Gammes** : compléter le « texte de présentation » de chaque gamme (300 à 600 mots : usages, conseils, questions fréquentes).
5. **Admin → Conseils** : publier régulièrement (1 à 2 articles par mois) — ex. « Golfette homologuée route : quelle réglementation ? », « Lithium ou plomb ? », « Golfette pour camping : comment choisir ? ».
6. **Admin → Réalisations** : remplacer les exemples génériques par de vrais projets clients avec photos.

---

## Développement local

```bash
cp .env.example .env    # renseigner DATABASE_URL, AUTH_SECRET, UPLOAD_DIR=./uploads
npm install
npx prisma db push
npm run db:import
ADMIN_EMAIL=moi@test.fr ADMIN_PASSWORD=motdepasse-local npm run create-admin
npm run dev
```

## Arborescence

```
app/(site)/        pages publiques (accueil, gammes, véhicules, conseils, contact, SAV…)
app/admin/         back-office (+ actions serveur dans app/admin/actions)
app/actions/       traitement des formulaires publics
components/site    composants du site    components/admin  composants de l'admin
lib/               accès aux données, SEO, e-mails, envoi de fichiers, session
prisma/            schéma + data/catalog.json (catalogue d'origine)
public/media/      images du catalogue d'origine (WebP)
scripts/           import du catalogue, création d'administrateur
deploy/            Nginx, installation, mise à jour, sauvegarde
```

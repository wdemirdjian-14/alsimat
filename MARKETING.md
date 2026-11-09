# Alsimat — lancer les campagnes (SEO, SEA, réseaux sociaux)

Tout ce qui est prêt dans le site, et les réglages à faire une seule fois de votre côté.

## 1. Ce que le site mesure déjà

| Événement | Quand | Nom Google Analytics | Google Ads | Meta |
|---|---|---|---|---|
| Demande de devis / contact / SAV envoyée | formulaire validé | `generate_lead` | conversion « lead » | `Lead` |
| Message envoyé via Walau | formulaire Walau validé | `generate_lead` | conversion « lead » | `Lead` |
| Clic sur un numéro de téléphone | partout sur le site | `click_to_call` | — | `Contact` |
| Téléchargement d'une fiche technique | PDF | `file_download` | — | — |
| Ouverture de Walau | clic ou 30 s d'inactivité | `walau_open` | — | — |

**Provenance des contacts** : chaque demande enregistre d'où vient le visiteur (Google Ads, Facebook/Instagram, `utm_…` de la campagne, recherche naturelle, lien externe ou accès direct). Elle s'affiche dans **Admin → Demandes → Provenance** et dans l'e-mail de notification.

**RGPD / CNIL** : aucun outil de mesure n'est chargé sans l'accord du visiteur (bandeau « Accepter / Refuser », lien « Cookies » en pied de page pour changer d'avis). Sans identifiant configuré, il n'y a ni bandeau ni cookie.

## 2. Brancher les outils (une seule fois)

**Avec Google Tag Manager (GTM)** : collez l'ID `GTM-…` dans Admin → Marketing & SEA. Le site pousse dans le `dataLayer` les événements `generate_lead`, `click_to_call`, `file_download`, `walau_open` : dans GTM, créez un déclencheur « Événement personnalisé » portant ce nom, puis les balises GA4 / Google Ads / Meta associées. N'activez pas en plus le champ GA4 de l'admin (sinon double comptage).


> Plus simple : **Admin → Marketing & SEA → Mesure d'audience & publicité** — collez les identifiants, enregistrez, c'est actif immédiatement. La méthode `.env` ci-dessous reste possible.


1. Créez les comptes et récupérez les identifiants :
   - **Google Analytics 4** → Administration → Flux de données → `G-XXXXXXXXXX`
   - **Google Ads** → Objectifs → Conversions → nouvelle conversion « Site web », catégorie *Envoi de formulaire pour prospect*, configuration **manuelle avec Google tag** → notez `AW-XXXXXXXXX` et le **libellé** de conversion.
   - **Meta** (Facebook/Instagram) → Gestionnaire d'événements → Pixel → identifiant à 15-16 chiffres.
2. Sur le VPS, ajoutez-les dans `/opt/alsimat/.env` :
   ```
   GA4_ID=G-XXXXXXXXXX
   GOOGLE_ADS_ID=AW-XXXXXXXXX
   GOOGLE_ADS_LEAD_LABEL=xxxxxxxxxxxx
   META_PIXEL_ID=1234567890123456
   ```
3. Appliquez sans reconstruire : `cd /opt/alsimat && docker compose up -d app`

## 3. Référencement naturel (SEO)

- **Google Search Console** : ajoutez la propriété *Domaine* `alsimat.com` (validation par enregistrement TXT chez IONOS), puis **Sitemaps → `https://alsimat.com/sitemap.xml`**.
- **Bing Webmaster Tools** : importez directement depuis Search Console (2 clics).
- **Google Business Profile** : fiche Alsimat avec adresse, horaires, photos des véhicules, lien vers le site. Demandez des avis à chaque livraison.
- **IA (ChatGPT, Perplexity, Gemini…)** : `https://alsimat.com/llms.txt` résume le catalogue. Aucune action requise.
- **Contenu** : 1 à 2 articles « Conseils » par mois. Sujets qui recherchent beaucoup : *golfette électrique prix*, *golfette homologuée route*, *voiturette électrique pour camping*, *utilitaire électrique L7e*, *golfette lithium ou plomb*, *golfette PMR*.
- **Gammes** : remplissez le « texte de présentation » de chaque gamme (300-600 mots) dans l'admin.

## 4. Google Ads (SEA)

**Structure conseillée pour démarrer :**

| Campagne | Type | Ciblage / mots-clés | Page d'arrivée |
|---|---|---|---|
| Marque | Réseau de recherche | `alsimat`, `alsimat golfette` | `/` |
| Golfettes | Réseau de recherche | `golfette électrique`, `golfette électrique prix`, `achat golfette électrique`, `golfette 4 places` | `/gammes/golfette-utilitaire` |
| Utilitaires & route | Réseau de recherche | `utilitaire électrique homologué`, `véhicule électrique L7e`, `mini utilitaire électrique benne` | `/vehicules/street-2-cargo` |
| Professionnels | Réseau de recherche | `golfette camping`, `véhicule électrique collectivité`, `navette électrique hôtel` | gamme correspondante |
| Catalogue | **Performance Max** + flux Merchant Center | automatique | fiches produits |

- Mots-clés négatifs à ajouter dès le départ : `location`, `occasion` (si pas de stock d'occasion), `jouet`, `enfant`, `pièces`, `batterie seule`, `golf` (seul).
- Ciblage : France (ou vos régions), enchères « Maximiser les conversions » après ~30 conversions.
- **Merchant Center** (pour Performance Max et les fiches gratuites Google Shopping) : *Produits → Sources → Ajouter une source → URL* : `https://alsimat.com/feeds/google-shopping.xml` (mise à jour quotidienne). Prix envoyés TTC, promos (`sale_price`) et disponibilité (stock) incluses.

## 5. Meta (Facebook / Instagram)

- **Catalogue** : Commerce Manager → Catalogue → Sources de données → *Flux planifié* : `https://alsimat.com/feeds/google-shopping.xml` (même flux, format compatible).
- Campagnes : *Prospects* (objectif) avec les vidéos et photos réelles des vitrines (Link 2 Cargo, Street 2 Cargo), audiences : gérants de campings/hôtels, collectivités, golfs, agriculteurs, artisans.

## 6. Liens de campagne (UTM)

Ajoutez toujours des UTM aux liens hors Google Ads (Google Ads ajoute `gclid` tout seul) :

```
https://alsimat.com/vehicules/link-2-cargo?utm_source=facebook&utm_medium=paid&utm_campaign=lancement-link2cargo
https://alsimat.com/?utm_source=newsletter&utm_medium=email&utm_campaign=promo-automne
https://alsimat.com/gammes/bus?utm_source=salon&utm_medium=qr&utm_campaign=salon-maires-2026
```

## 7. Piloter les offres du moment

Dans **Admin → Véhicules → (un véhicule)** :
- **Stock disponible** : affiché « 3 en stock » / « Dernières unités », annoncé par l'écran de chargement de l'accueil et envoyé à Google Shopping (`in_stock` / `preorder`).
- **Prix promo, libellé, date de fin** : prix barré partout (accueil, cartes, fiche, Google Shopping), disparaît tout seul à la date de fin.
- **À la une** : place le véhicule en tête du carrousel « Véhicules du moment ».

L'accueil met automatiquement en avant, dans l'ordre : vitrines « À la une », promotions en cours, véhicules en stock, coups de cœur.

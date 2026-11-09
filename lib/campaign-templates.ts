/**
 * Modèles de campagnes de présentation, prêts à envoyer (à relire et adapter).
 * Champs de fusion : {{prenom}} {{nom}} {{societe}} {{ville}}.
 */
export type CampaignTemplate = { key: string; label: string; audience: string; name: string; subject: string; preheader: string; body: string; ctaLabel: string; ctaUrl: string; image: string };

const SIGNATURE = `Bien cordialement,

**L'équipe Alsimat**
Entreprise française · conseil, livraison et SAV partout en France
[alsimat.com](https://alsimat.com)`;

const QUI = `## Qui sommes-nous ?
**Alsimat est une entreprise française, basée en France**, spécialisée dans les golfettes et véhicules électriques professionnels. Nous accompagnons nos clients de A à Z : conseil sur le bon modèle, devis personnalisé, livraison et prise en main, puis **service après-vente directement sur site, partout en France**.`;

const MODELES = `## Nos modèles du moment
- **Link 2 Cargo** : golfette 2 places avec benne de 250 kg, batterie Lithium garantie 5 ans, plus de 100 km d'autonomie, **dès 9 300 € HT**. [Découvrir](/vehicules/link-2-cargo)
- **Street 2 Cargo** : utilitaire électrique **homologué route** (L7e), cabine fermée, benne aluminium, conduite avec le permis B, **14 900 € HT**. [Découvrir](/vehicules/street-2-cargo)
- Et plus de 40 modèles : golfettes 2 à 8 places, tout-terrain, PMR, navettes jusqu'à 29 places. [Voir toutes les gammes](/gammes/golfette-utilitaire)`;

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    key: "campings", label: "Campings & hôtellerie de plein air", audience: "Campings, villages vacances, parcs résidentiels",
    name: "Présentation – campings", subject: "{{prenom}}, des golfettes électriques pour {{societe}} ?",
    preheader: "Navettes clients, entretien, logistique : silencieux et sans émission. Entreprise française, SAV sur site.",
    body: `Bonjour {{prenom}},

Accueil des vacanciers, transport des bagages, entretien des allées, livraison du linge ou du pain : à **{{societe}}**, vos équipes parcourent chaque jour des kilomètres.

Nos golfettes électriques les accompagnent **en silence, sans odeur ni émission** — un vrai plus pour le confort de vos clients — avec des versions 2 à 8 places, à banquette réversible ou à benne.

${QUI}

${MODELES}

Coloris et sellerie personnalisables à vos couleurs, batteries Lithium sans entretien : branchez le soir, roulez toute la journée.

Seriez-vous disponible 10 minutes avant la saison pour en parler ? Il vous suffit de répondre à cet e-mail.

${SIGNATURE}`,
    ctaLabel: "Voir les véhicules du moment", ctaUrl: "/?utm_content=campings", image: "/media/golfette-electrique-link-2-cargo-benne-photo-1.webp",
  },
  {
    key: "collectivites", label: "Mairies & collectivités", audience: "Mairies, communautés de communes, services techniques",
    name: "Présentation – collectivités", subject: "Véhicules électriques pour les services techniques de {{ville}}",
    preheader: "Espaces verts, voirie, centre-ville : des utilitaires électriques compacts, homologués route. Entreprise française.",
    body: `Bonjour,

Espaces verts, propreté urbaine, entretien des bâtiments, déplacements en centre-ville : vos services techniques ont besoin de véhicules **compacts, silencieux et sans émission**.

Alsimat propose des utilitaires électriques adaptés aux collectivités, dont des modèles **homologués route** qui circulent sur la voie publique avec un simple permis B.

${QUI}

${MODELES}

Nous pouvons vous transmettre une offre détaillée pour vos services ou organiser un essai sur votre commune.

Il vous suffit de répondre à cet e-mail en indiquant le service concerné.

${SIGNATURE}`,
    ctaLabel: "Découvrir les utilitaires", ctaUrl: "/gammes/utilitaires?utm_content=collectivites", image: "/media/utilitaire-electrique-street-2-cargo-homologue-route-profil.webp",
  },
  {
    key: "hotellerie", label: "Hôtels, domaines & résidences", audience: "Hôtels avec parc, résidences de tourisme, domaines, châteaux",
    name: "Présentation – hôtellerie & domaines", subject: "Une golfette électrique à l'image de {{societe}}",
    preheader: "Navette clients, bagagerie, entretien du parc : élégante, silencieuse, personnalisable. Entreprise française.",
    body: `Bonjour {{prenom}},

Accueillir vos clients au parking, transporter leurs bagages, entretenir le parc : une golfette électrique offre **un service premium, silencieux et respectueux du lieu**.

Carrosserie et sellerie se personnalisent aux couleurs de **{{societe}}**.

${QUI}

${MODELES}

Je vous propose de vous envoyer une sélection de modèles adaptés à votre établissement : répondez simplement à cet e-mail.

${SIGNATURE}`,
    ctaLabel: "Voir nos golfettes", ctaUrl: "/gammes/transport-de-personnes?utm_content=hotellerie", image: "/media/golfette-electrique-link-4-flex.webp",
  },
  {
    key: "entreprises", label: "Industrie, logistique & grands sites", audience: "Sites industriels, entrepôts, golfs, parcs de loisirs, zoos, ports",
    name: "Présentation – grands sites", subject: "Déplacements et transport de matériel sur votre site",
    preheader: "Golfettes utilitaires et véhicules électriques pour vos équipes : 2 places + benne, jusqu'à 100 km d'autonomie.",
    body: `Bonjour {{prenom}},

Sur un grand site, vos équipes perdent un temps précieux à se déplacer et à transporter matériel et outillage.

Nos golfettes utilitaires électriques — **2 places + benne de 250 kg**, jusqu'à 100 km d'autonomie — sont pensées pour ces trajets quotidiens, en intérieur comme en extérieur.

${QUI}

${MODELES}

Souhaitez-vous recevoir une proposition adaptée à {{societe}} ? Répondez simplement à cet e-mail.

${SIGNATURE}`,
    ctaLabel: "Découvrir le Link 2 Cargo", ctaUrl: "/vehicules/link-2-cargo?utm_content=entreprises", image: "/media/golfette-electrique-link-2-cargo-benne-photo-2.webp",
  },
  {
    key: "sante", label: "Santé, EHPAD & PMR", audience: "EHPAD, hôpitaux, centres de rééducation, établissements médico-sociaux",
    name: "Présentation – santé & PMR", subject: "Faciliter les déplacements des résidents et des équipes",
    preheader: "Golfettes médicalisées et accessibles PMR, silencieuses et sans émission. Entreprise française, SAV sur site.",
    body: `Bonjour,

Dans les établissements de santé, chaque déplacement compte : résidents à mobilité réduite, visiteurs, transport de linge ou de repas entre les bâtiments.

Alsimat propose des **golfettes médicalisées et accessibles PMR**, silencieuses et sans émission, ainsi que des navettes pour vos visiteurs.

${QUI}

## Nos solutions
- **Access 4 PMR** et **Link 2 Medical** : accès facilité, transport assis ou allongé
- **Navettes Shuttle** jusqu'à 14 places pour vos visiteurs
- Utilitaires à benne pour la logistique interne

[Voir la gamme Médical & PMR](/gammes/medical-pmr)

Répondez simplement à cet e-mail pour recevoir une documentation adaptée à votre établissement.

${SIGNATURE}`,
    ctaLabel: "Voir la gamme Médical & PMR", ctaUrl: "/gammes/medical-pmr?utm_content=sante", image: "/media/golfette-electrique-access-4-pmr.webp",
  },
];

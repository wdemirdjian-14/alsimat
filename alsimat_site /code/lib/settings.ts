import { prisma } from '@/lib/db';

/**
 * Clés de réglages du site (toggles de visibilité + contenus éditables).
 */
export const SETTING_KEYS = {
  realisationsVisible: 'realisations_visible',
  occasionVisible: 'occasion_visible',
  promotionsVisible: 'promotions_visible',
  configurateurVisible: 'configurateur_visible',
  homeContent: 'home_content',
  aboutContent: 'about_content',
} as const;

export interface HomeContent {
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImage: string;
  gammesTitle: string;
  gammesSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
}

export interface AboutContent {
  subtitle: string;
  image: string;
  introParagraphs: string[];
  bodyParagraphs: string[];
  stats: { label: string; value: string }[];
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroTitle: 'bienvenue chez',
  heroHighlight: 'alsimat',
  heroSubtitle: 'votre spécialiste tracteurs et nacelles électriques',
  heroImage:
    'https://cdn.abacus.ai/images/38c68639-0dde-4fe2-bb70-8dd2d633e775.png',
  gammesTitle: 'Nos gammes',
  gammesSubtitle: 'Retrouvez tous les produits Alsimat',
  ctaTitle: 'Un projet ? Une question ?',
  ctaSubtitle:
    "Contactez-nous pour obtenir un devis personnalisé ou pour toute demande d'information.",
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  subtitle: 'Qui sommes nous ?',
  image: 'https://cdn.abacus.ai/images/bcb7d51d-7b15-456a-9a6e-47500f879507.png',
  introParagraphs: [
    'La société <strong>ALSIMAT</strong> est née en 2018 de la rencontre de deux professionnels du domaine des engins de manutention et de levage à propulsion électrique.',
    'Une demande croissante du marché français, pour des engins conçus et fabriqués en France ou en Europe, leur a permis de développer plusieurs partenariats avec des constructeurs répondant à des critères de proximité géographique, de personnalisation souple, de circuits courts, de fiabilité et de prix correspondant aux attentes des marchés.',
  ],
  bodyParagraphs: [
    '<strong>Fournisseur du réseau EDirect,</strong> qui assure une couverture nationale et européenne de leur offre ainsi que la force commerciale et technique de près de 65 partenaires sur tout le territoire, ALSIMAT poursuit le développement de sa gamme.',
    'Notre savoir-faire et notre expérience nous permettent de proposer des solutions sur des marchés nouveaux et de mettre à jour continuellement nos offres en produits et services.',
    "<strong>Les gammes de tracteurs Ebox,</strong> conçus et fabriqués en France, permettent de véhiculer électriquement des personnes ou des charges selon les attentes des utilisateurs. Ils trouvent une parfaite utilisation dans les domaines des services publics, des parcs de loisirs, de l'industrie, des hôpitaux, en résumé dans tous les domaines exigeant un déplacement fréquent et silencieux.",
    'Leurs batteries, en plomb pur ou lithium, assurent une autonomie qui peut atteindre la journée de travail complète, selon les conditions d\'utilisation. Les variateurs dont ils sont équipés, permettent un paramétrage de leur vitesse à la demande. Les véhicules ont l\'agrément immatriculation.',
    '<strong>ALSIMAT offre également des solutions de location,</strong> moyenne ou longue durée, sur des matériels neufs ou reconditionnels et selon les stocks disponibles.',
    "Fort d'une réelle expérience dans les matériels de manutentions de personnels, ALSIMAT a créé des liens étroits avec des fabricants Européens de nacelles élévatrices tractables électriques ou bi-énergies.",
  ],
  stats: [
    { label: 'Fondée en', value: '2018' },
    { label: 'Partenaires', value: '65+' },
    { label: 'Gammes', value: '4' },
    { label: 'Émissions', value: '0' },
  ],
};

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getBoolSetting(key: string, fallback = true): Promise<boolean> {
  const v = await getSetting(key);
  if (v === null) return fallback;
  return v === 'true';
}

export async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  const v = await getSetting(key);
  if (!v) return fallback;
  try {
    return { ...fallback, ...JSON.parse(v) } as T;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getVisibilityFlags() {
  const [realisations, occasion, promotions, configurateur] = await Promise.all([
    getBoolSetting(SETTING_KEYS.realisationsVisible, true),
    getBoolSetting(SETTING_KEYS.occasionVisible, true),
    getBoolSetting(SETTING_KEYS.promotionsVisible, true),
    getBoolSetting(SETTING_KEYS.configurateurVisible, true),
  ]);
  return { realisations, occasion, promotions, configurateur };
}

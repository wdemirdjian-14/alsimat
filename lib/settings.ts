import { cache } from "react";
import { db } from "./db";
import { DEFAULT_COMPANY, type CompanyInfo } from "./site";

export type HomeContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImage: string;
  gammesTitle: string;
  gammesSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
};

export type AboutContent = {
  title: string;
  intro: string;
  body: string;
  image: string;
  stats: { value: string; label: string }[];
};

export type Visibility = {
  occasion: boolean;
  promotions: boolean;
  realisations: boolean;
  conseils: boolean;
};

export const DEFAULT_HOME: HomeContent = {
  heroEyebrow: "Alsimat · Golfettes & véhicules électriques",
  heroTitle: "La golfette électrique",
  heroHighlight: "taillée pour votre usage",
  heroSubtitle:
    "Transport de personnes, utilitaires, tout-terrain, homologuées route, PMR et navettes : Alsimat vous conseille, vous livre et assure le SAV sur site.",
  heroImage: "/media/golfette-electrique-alsimat-accueil.webp",
  gammesTitle: "Nos gammes",
  gammesSubtitle: "Une solution électrique pour chaque usage, du golf au site industriel.",
  ctaTitle: "Un projet ? Une question ?",
  ctaSubtitle: "Contactez-nous pour obtenir un devis personnalisé ou pour toute demande d'information.",
};

export const DEFAULT_ABOUT: AboutContent = {
  title: "Qui sommes-nous ?",
  intro:
    "Alsimat accompagne les professionnels, collectivités et particuliers dans le choix, la livraison et l'entretien de leurs golfettes et véhicules électriques.",
  body:
    "Notre métier : vous conseiller le véhicule réellement adapté à votre usage — transport de passagers, logistique sur site, terrains exigeants ou circulation sur route — puis vous accompagner dans la durée.\n\nChaque véhicule est livré prêt à l'emploi, configurable (coloris, sellerie, options) et suivi par notre service après-vente, qui intervient directement sur site pour l'entretien et le diagnostic.",
  image: "",
  stats: [
    { value: "40+", label: "modèles électriques" },
    { value: "5 ans", label: "de garantie batterie Lithium" },
    { value: "100 km", label: "d'autonomie jusqu'à" },
    { value: "SAV", label: "sur site" },
  ],
};

export const DEFAULT_VISIBILITY: Visibility = { occasion: true, promotions: true, realisations: true, conseils: true };

const DEFAULTS = {
  home_content: DEFAULT_HOME,
  about_content: DEFAULT_ABOUT,
  visibility: DEFAULT_VISIBILITY,
  company: DEFAULT_COMPANY,
} as const;

type Settings = { home_content: HomeContent; about_content: AboutContent; visibility: Visibility; company: CompanyInfo };
export type SettingKey = keyof Settings;

const loadAll = cache(async () => {
  const rows = await db.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export async function getSetting<K extends SettingKey>(key: K): Promise<Settings[K]> {
  const raw = (await loadAll())[key];
  let stored: Partial<Settings[K]> = {};
  try {
    stored = raw ? JSON.parse(raw) : {};
  } catch {}
  // Les champs vides de l'ancien CMS ne doivent pas écraser les valeurs par défaut.
  const clean = Object.fromEntries(
    Object.entries(stored).filter(([, v]) => v !== "" && v !== null && !(Array.isArray(v) && v.every((x) => !x || (typeof x === "object" && Object.values(x).every((y) => !y))))),
  );
  return { ...DEFAULTS[key], ...clean } as Settings[K];
}

export async function saveSetting<K extends SettingKey>(key: K, value: Settings[K]) {
  const json = JSON.stringify(value);
  await db.siteSetting.upsert({ where: { key }, update: { value: json }, create: { key, value: json } });
}

export const getCompany = () => getSetting("company");

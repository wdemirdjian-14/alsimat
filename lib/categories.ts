/** Types d'établissements prospectés : libellés et normalisation des valeurs importées. */
export const CATEGORY_LABELS: Record<string, string> = {
  camping: "Campings",
  "residence-tourisme": "Résidences de tourisme",
  "village-vacances": "Villages vacances",
  "parc-residentiel": "Parcs résidentiels de loisirs",
  "auberge-collective": "Auberges collectives",
  hotel: "Hôtels",
  collectivite: "Mairies & collectivités",
  golf: "Golfs",
  entreprise: "Entreprises & industrie",
  sante: "Santé & EHPAD",
  education: "Enseignement",
  evenementiel: "Événementiel",
  particulier: "Particuliers",
};

const SYNONYMS: Record<string, string> = {
  campings: "camping", "hotellerie-de-plein-air": "camping",
  "residence-de-tourisme": "residence-tourisme", "residences-de-tourisme": "residence-tourisme",
  "village-de-vacances": "village-vacances", "villages-vacances": "village-vacances", "villages-de-vacances": "village-vacances",
  "parc-residentiel-de-loisirs": "parc-residentiel", prl: "parc-residentiel",
  "auberges-collectives": "auberge-collective", "auberge-de-jeunesse": "auberge-collective",
  hotels: "hotel", hotellerie: "hotel",
  mairie: "collectivite", mairies: "collectivite", collectivites: "collectivite", commune: "collectivite", communes: "collectivite",
  golfs: "golf", entreprises: "entreprise", industrie: "entreprise", ehpad: "sante",
};

const slug = (s: string) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function normalizeCategory(v?: string | null) {
  if (!v) return null;
  const s = slug(v);
  return s ? (SYNONYMS[s] ?? s) : null;
}

export const categoryLabel = (k?: string | null) =>
  !k ? "Sans catégorie" : CATEGORY_LABELS[k] ?? k.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

/**
 * « camping,camping-3-etoiles,taille-petit » ou « Camping » + « 3 étoiles » →
 * catégorie principale, étoiles, taille et étiquettes.
 */
export function classify(categoryCell?: string, classementCell?: string) {
  const parts = (categoryCell ?? "").split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
  const category = normalizeCategory(parts[0]);
  let stars: number | null = null;
  let size: string | null = null;
  const tags = new Set<string>();
  for (const p of [...parts, classementCell ?? ""].filter(Boolean)) {
    const s = slug(p);
    const m = s.match(/(?:^|-)([1-5])-etoiles?$/);
    if (m) stars = Number(m[1]);
    const t = s.match(/^taille-(petit|moyen|grand)$/);
    if (t) size = t[1];
    if (s && p !== classementCell) tags.add(SYNONYMS[s] ?? s);
  }
  if (category && stars) tags.add(`${category}-${stars}-etoiles`);
  return { category, stars, size, tags: [...tags] };
}

export const SIZES = [
  { key: "petit", label: "Petit (< 100 empl.)" },
  { key: "moyen", label: "Moyen (100–250)" },
  { key: "grand", label: "Grand (> 250)" },
];

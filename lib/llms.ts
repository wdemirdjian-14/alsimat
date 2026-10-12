import { getAllVehicles, getCategoryTree, keySpecs, specsOf } from "./catalog";
import { getArticles } from "./content";
import { getCompany } from "./settings";
import { SITE_URL } from "./site";
import { formatPrice } from "./utils";

/**
 * Fichier llms.txt (https://llmstxt.org) : résumé du site en Markdown pour les moteurs
 * de réponse (ChatGPT, Perplexity, Gemini, Claude…). `full` inclut descriptions et fiches complètes.
 */
export async function buildLlmsTxt(full: boolean) {
  const [company, tree, vehicles, articles] = await Promise.all([getCompany(), getCategoryTree(), getAllVehicles(), getArticles()]);
  const address = [company.street, company.postalCode, company.city].filter(Boolean).join(" ");
  const L: string[] = [
    `# ${company.name}`,
    "",
    `> ${company.name} est un spécialiste français de la golfette électrique et des véhicules électriques professionnels (transport de personnes, utilitaires, tout-terrain, homologués route, médical & PMR, bus et navettes). Conseil, devis personnalisé, livraison et service après-vente sur site partout en France.`,
    "",
    `- Site : ${SITE_URL}`,
    `- Téléphone : ${company.phone}`,
    `- E-mail : ${company.email}`,
    ...(address ? [`- Adresse : ${address}`] : []),
    `- Devis gratuit : ${SITE_URL}/contact`,
    `- Service après-vente : ${SITE_URL}/sav`,
    "- Prix indiqués hors taxes (HT), version de base.",
    "",
  ];

  const spot = vehicles.filter((v) => v.spotlight);
  if (spot.length) {
    L.push("## Modèles à la une", "");
    for (const v of spot) L.push(`- [${v.name.trim()}](${SITE_URL}/vehicules/${v.slug}) : ${v.tagline ?? v.shortDescription ?? ""} Prix : ${formatPrice(v.price)}.`);
    L.push("");
  }

  for (const c of tree.flatMap((c) => [c, ...c.children])) {
    const list = vehicles.filter((v) => v.categories.some((x) => x.categoryId === c.id));
    if (!list.length) continue;
    L.push(`## ${c.name}`, "", `${c.description ?? ""} (${SITE_URL}/gammes/${c.slug})`, "");
    for (const v of list) {
      const s = keySpecs(v);
      const facts = [s.seats && `${s.seats} places`, s.rangeKm && `${s.rangeKm} km d'autonomie`, s.speedKmh && `${s.speedKmh} km/h`, s.roadLegal && "homologué route", formatPrice(v.price)].filter(Boolean).join(", ");
      L.push(`- [${v.name.trim()}](${SITE_URL}/vehicules/${v.slug}) : ${facts}`);
      if (full) {
        if (v.description) L.push("", v.description.replace(/\n+/g, " "), "");
        const specs = Object.entries(specsOf(v));
        if (specs.length) L.push(...specs.map(([k, val]) => `  - ${k} : ${val}`), "");
      }
    }
    L.push("");
  }

  if (articles.length) {
    L.push("## Conseils", "");
    for (const a of articles) L.push(`- [${a.title}](${SITE_URL}/conseils/${a.slug})${a.excerpt ? ` : ${a.excerpt}` : ""}`);
    L.push("");
  }
  L.push("## Optional", "", `- [Catalogue complet (texte intégral)](${SITE_URL}/llms-full.txt)`, `- [Plan du site](${SITE_URL}/plan-du-site)`, `- [Sitemap XML](${SITE_URL}/sitemap.xml)`);
  return L.join("\n");
}

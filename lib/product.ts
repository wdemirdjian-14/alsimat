import type { FaqItem } from "@/components/site/faq";
import { SITE_URL } from "./site";
import { keySpecs, specsOf, type VehicleWithCats } from "./specs";
import { firstNumber } from "./utils";

/** Regroupement des caractéristiques pour la fiche technique. */
const GROUPS: [string, RegExp][] = [
  ["Motorisation", /^(alimentation|moteur|motorisation|batterie|tension)/i],
  ["Performances", /^(vitesse|autonomie|recharge|charge max|pente|rayon|gravissement)/i],
  ["Capacités", /^(places|capacit|dimensions de la benne|benne|poids|charge utile)/i],
  ["Dimensions", /^(longueur|largeur|hauteur|empattement|garde)/i],
];

export function groupedSpecs(v: { characteristics: unknown }) {
  const specs = specsOf(v);
  const groups = new Map<string, [string, string][]>();
  for (const [k, val] of Object.entries(specs)) {
    const g = GROUPS.find(([, re]) => re.test(k))?.[0] ?? "Autres";
    groups.set(g, [...(groups.get(g) ?? []), [k, val]]);
  }
  return [...GROUPS.map(([g]) => g), "Autres"].filter((g) => groups.has(g)).map((g) => ({ title: g, rows: groups.get(g)! }));
}

export const isBus = (v: { categories: { category: { slug: string } }[] }) => v.categories.some((c) => c.category.slug === "bus");
export const vehicleKind = (v: VehicleWithCats) => v.vehicleType || (isBus(v) ? "Bus électrique" : "Golfette électrique");

/** FAQ produit générée à partir des données (sert aussi aux moteurs de réponse / LLM). */
export function productFaq(v: VehicleWithCats): FaqItem[] {
  const s = keySpecs(v);
  const specs = specsOf(v);
  const name = v.name.trim();
  const find = (re: RegExp) => Object.entries(specs).find(([k]) => re.test(k))?.[1];
  const faq: FaqItem[] = [];
  if (s.price) faq.push({ q: `Quel est le prix du ${name} ?`, a: `Le ${name} est proposé à partir de ${new Intl.NumberFormat("fr-FR").format(s.price)} € HT en version de base. Le prix final dépend des options et de la personnalisation : demandez un devis gratuit à Alsimat.` });
  if (s.range) faq.push({ q: `Quelle est l'autonomie du ${name} ?`, a: `${s.range}.${s.battery ? ` Il est équipé d'une batterie ${s.battery}.` : ""}` });
  const r85 = find(/recharge.*85/i), r100 = find(/recharge.*100/i);
  if (r85 || r100) faq.push({ q: `Combien de temps faut-il pour recharger le ${name} ?`, a: [r85 && `${r85} pour atteindre 85 %`, r100 && `${r100} pour une charge complète`].filter(Boolean).join(", ") + "." });
  const benne = find(/capacit.*benne|charge utile/i), dims = find(/dimensions de la benne/i);
  if (benne || dims) faq.push({ q: `Quelle charge peut transporter le ${name} ?`, a: `Sa benne${dims ? ` de ${dims}` : ""}${benne ? ` accepte jusqu'à ${benne}` : ""}.${find(/charge max/i) ? ` La charge maximale totale est de ${find(/charge max/i)}.` : ""}` });
  faq.push({
    q: `Faut-il un permis pour conduire le ${name} ?`,
    a: s.roadLegal
      ? `Le ${name} est homologué pour la route${s.licence ? ` et se conduit avec le ${s.licence.charAt(0).toLowerCase() + s.licence.slice(1)}` : ""}.`
      : `Le ${name} est destiné aux voies et sites privés (hôtels, campings, golfs, sites industriels…), où il se conduit sans permis. Pour circuler sur la voie publique, choisissez un modèle homologué route.`,
  });
  if (v.colors.length) faq.push({ q: `Le ${name} est-il personnalisable ?`, a: `Oui : carrosserie ${v.colors.join(", ").toLowerCase()}${v.upholstery.length ? `, et plusieurs selleries (${v.upholstery.join(", ").toLowerCase()})` : ""}.` });
  faq.push({ q: `Qui assure l'entretien du ${name} ?`, a: "Le SAV Alsimat intervient directement sur site, partout en France, pour l'entretien, le diagnostic et le suivi du véhicule." });
  return faq;
}

/** Données structurées schema.org Product (Google, Bing, moteurs de réponse). */
export function productJsonLd(v: VehicleWithCats, categoryName?: string) {
  const s = keySpecs(v);
  const specs = specsOf(v);
  const url = `${SITE_URL}/vehicules/${v.slug}`;
  const mm = (re: RegExp) => {
    const n = firstNumber(Object.entries(specs).find(([k]) => re.test(k))?.[1]?.replace(/\s/g, ""));
    return n ? { "@type": "QuantitativeValue", value: n, unitCode: "MMT" } : undefined;
  };
  const weight = firstNumber(Object.entries(specs).find(([k]) => /poids/i.test(k))?.[1]);
  return {
    "@context": "https://schema.org",
    "@type": ["Product", "Vehicle"],
    name: v.name.trim(),
    description: v.shortDescription ?? undefined,
    image: v.images.map((i) => SITE_URL + i),
    url,
    sku: v.sku || v.slug,
    ...(v.sku ? { mpn: v.sku } : {}),
    category: categoryName,
    brand: { "@type": "Brand", name: v.brand || "Alsimat" },
    vehicleConfiguration: v.name.trim(),
    fuelType: "Électrique",
    ...(s.seats ? { seatingCapacity: s.seats } : {}),
    ...(s.speedKmh ? { speed: { "@type": "QuantitativeValue", maxValue: s.speedKmh, unitCode: "KMH" } } : {}),
    ...(weight ? { weight: { "@type": "QuantitativeValue", value: weight, unitCode: "KGM" } } : {}),
    ...(mm(/^longueur/i) ? { depth: mm(/^longueur/i), width: mm(/^largeur/i), height: mm(/^hauteur/i) } : {}),
    ...(v.colors.length ? { color: v.colors.join(", ") } : {}),
    additionalProperty: Object.entries(specs).map(([k, val]) => ({ "@type": "PropertyValue", name: k, value: val })),
    ...(v.video
      ? { subjectOf: { "@type": "VideoObject", name: `${v.name.trim()} en vidéo`, description: v.tagline ?? v.shortDescription ?? v.name, contentUrl: SITE_URL + v.video, thumbnailUrl: SITE_URL + (v.images[0] ?? ""), uploadDate: v.updatedAt.toISOString() } }
      : {}),
    ...(s.price
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "EUR",
            price: s.price,
            priceSpecification: { "@type": "UnitPriceSpecification", price: s.price, priceCurrency: "EUR", valueAddedTaxIncluded: false },
            priceValidUntil: `${new Date().getFullYear()}-12-31`,
            itemCondition: "https://schema.org/NewCondition",
            availability: "https://schema.org/InStock",
            seller: { "@id": `${SITE_URL}/#organization` },
          },
        }
      : {}),
  };
}

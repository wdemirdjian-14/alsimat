import type { Category, Prisma, Vehicle } from "@prisma/client";
import { firstNumber, parsePrice } from "./utils";

/** Fonctions pures (utilisables côté client) autour des caractéristiques véhicules. */
export type Specs = Record<string, string>;
export type CategoryNode = Category & { children: Category[]; vehicleCount: number };
export type VehicleWithCats = Prisma.VehicleGetPayload<{ include: { categories: { include: { category: true } } } }>;

export const specsOf = (v: { characteristics: unknown }): Specs =>
  v.characteristics && typeof v.characteristics === "object" && !Array.isArray(v.characteristics)
    ? (v.characteristics as Specs)
    : {};

/** Résumé normalisé utilisé par les cartes, les filtres et les comparatifs. */
export function keySpecs(v: Vehicle & { categories?: { category: Category }[] }) {
  const s = specsOf(v);
  const get = (...keys: string[]) => {
    const k = Object.keys(s).find((key) => keys.some((x) => key.toLowerCase().startsWith(x)));
    return k ? s[k] : undefined;
  };
  const seatsRaw = get("places", "capacité");
  const slugs = (v.categories ?? []).map((c) => c.category.slug);
  const name = v.name.toLowerCase();
  return {
    seats: firstNumber(seatsRaw),
    range: get("autonomie"),
    rangeKm: firstNumber(get("autonomie")),
    speed: get("vitesse"),
    speedKmh: firstNumber(get("vitesse")),
    motor: get("moteur", "motorisation"),
    battery: get("batterie"),
    licence: get("permis"),
    roadLegal: slugs.includes("homologues-route") || /permis/i.test(get("permis") ?? ""),
    cargo: /cargo|box|benne/.test(name) || slugs.includes("utilitaires"),
    price: parsePrice(v.price),
  };
}


/** Offre promotionnelle en cours (prix promo renseigné et non expiré). */
export function activePromo(v: { promoPrice: string | null; promoLabel: string | null; promoEndsAt: Date | null; price: string | null }) {
  if (!v.promoPrice) return null;
  if (v.promoEndsAt && new Date(v.promoEndsAt) < new Date()) return null;
  const promo = parsePrice(v.promoPrice);
  const base = parsePrice(v.price);
  const pct = promo && base && base > promo ? Math.round((1 - promo / base) * 100) : null;
  return { price: v.promoPrice, label: v.promoLabel || (pct ? `-${pct} %` : "Offre spéciale"), pct, endsAt: v.promoEndsAt };
}

/** Libellé de disponibilité : null si sur commande. */
export function stockLabel(stock: number) {
  if (stock <= 0) return null;
  if (stock <= 2) return stock === 1 ? "Dernier exemplaire" : "Dernières unités";
  return `${stock} en stock`;
}

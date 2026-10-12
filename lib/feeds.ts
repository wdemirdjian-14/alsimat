import { getAllVehicles, keySpecs, primaryCategory } from "./catalog";
import { SITE_URL } from "./site";
import { truncate } from "./utils";

export const VAT = 0.2;

/** Produits exportables vers les places de marché : publiés, avec prix et photo. */
export async function feedItems() {
  const vehicles = await getAllVehicles();
  return vehicles
    .filter((v) => v.categories.length && v.images.length && keySpecs(v).price)
    .map((v) => {
      const s = keySpecs(v);
      const cat = primaryCategory(v);
      const ht = s.price!;
      const kind = v.vehicleType || (v.categories.some((c) => c.category.slug === "bus") ? "Bus électrique" : "Golfette électrique");
      return {
        id: v.sku || v.slug,
        title: truncate(`${kind} ${v.name.trim()}${s.seats ? ` ${s.seats} places` : ""}${s.rangeKm ? ` – ${s.rangeKm} km d'autonomie` : ""}`, 150),
        description: truncate(`${v.shortDescription ?? ""} ${v.description ?? ""}`.replace(/\s+/g, " "), 4900),
        link: `${SITE_URL}/vehicules/${v.slug}`,
        image: SITE_URL + v.images[0],
        extraImages: v.images.slice(1, 10).map((i) => SITE_URL + i),
        priceHt: ht,
        priceTtc: Math.round(ht * (1 + VAT) * 100) / 100,
        productType: ["Véhicules électriques", cat?.name].filter(Boolean).join(" > "),
        mpn: v.sku,
        color: v.colors[0],
        brand: v.brand || "Alsimat",
        highlights: [s.seats && `${s.seats} places`, s.range, s.speed && `Vitesse max ${s.speed}`, s.battery && `Batterie ${s.battery}`].filter(Boolean) as string[],
      };
    });
}

export const xmlEscape = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

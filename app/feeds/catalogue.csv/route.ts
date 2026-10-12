import { feedItems } from "@/lib/feeds";

export const dynamic = "force-dynamic";

/** Catalogue CSV (séparateur ;) pour import manuel sur d'autres places de marché (Leboncoin Pro, annuaires B2B…). */
export async function GET() {
  const items = await feedItems();
  const cell = (v: string | number | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["reference", "titre", "description", "prix_ht", "prix_ttc", "lien", "image", "images_supplementaires", "categorie", "marque"];
  const rows = items.map((i) =>
    [i.id, i.title, i.description, i.priceHt, i.priceTtc, i.link, i.image, i.extraImages.join(" "), i.productType, "Alsimat"].map(cell).join(";"),
  );
  return new Response("﻿" + [head.join(";"), ...rows].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'inline; filename="alsimat-catalogue.csv"' },
  });
}

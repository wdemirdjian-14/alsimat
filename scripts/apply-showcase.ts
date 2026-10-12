/**
 * Applique les fiches « vitrine » de prisma/data/showcase.json (photos, vidéo, fiche technique,
 * caractéristiques complètes, mise en avant). Écrase les champs listés pour chaque slug.
 *
 *   npx tsx scripts/apply-showcase.ts            (toutes les fiches)
 *   npx tsx scripts/apply-showcase.ts link-2-cargo
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const only = process.argv[2];
  const entries: ({ slug: string } & Record<string, unknown>)[] = JSON.parse(
    readFileSync(join(__dirname, "../prisma/data/showcase.json"), "utf8"),
  );
  for (const { slug, ...data } of entries) {
    if (only && slug !== only) continue;
    const { categories, ...fields } = data as { categories?: string[] } & Record<string, unknown>;
    const catIds = categories?.length ? (await db.category.findMany({ where: { slug: { in: categories } } })).map((c) => ({ categoryId: c.id })) : null;
    const v = await db.vehicle.findUnique({ where: { slug } });
    if (!v) {
      if (!fields.name) {
        console.warn(`⚠ Véhicule introuvable (et pas de « name » pour le créer) : ${slug}`);
        continue;
      }
      await db.vehicle.create({ data: { slug, ...(fields as { name: string }), published: true, ...(catIds ? { categories: { create: catIds } } : {}) } });
      console.log(`✓ Véhicule créé : ${fields.name}`);
      continue;
    }
    await db.vehicle.update({
      where: { slug },
      data: { ...fields, published: true, ...(catIds ? { categories: { deleteMany: {}, create: catIds } } : {}) },
    });
    console.log(`✓ Fiche vitrine appliquée : ${v.name.trim()}`);
  }
}

main().finally(() => db.$disconnect());

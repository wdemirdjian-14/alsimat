/**
 * Importe le catalogue de l'ancien site (prisma/data/catalog.json) dans une base vide.
 * Idempotent : un élément déjà présent (même slug) n'est jamais écrasé,
 * ce qui permet de relancer le script sans perdre les modifications faites dans l'admin.
 *
 *   npm run db:import
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

type Catalog = {
  categories: { slug: string; name: string; description: string | null; image: string | null; order: number; parent: string | null }[];
  vehicles: {
    slug: string; name: string; shortDescription: string | null; description: string | null; price: string | null;
    characteristics: Record<string, string>; images: string[]; featured: boolean; published: boolean; categories: string[];
  }[];
  projects: { slug: string; title: string; description: string; image: string | null; date: string | null; published: boolean }[];
  articles: { slug: string; title: string; content: string; excerpt: string; image: string | null; publishedAt: string }[];
  settings: Record<string, unknown>;
};

const db = new PrismaClient();

async function main() {
  const data: Catalog = JSON.parse(readFileSync(join(__dirname, "../prisma/data/catalog.json"), "utf8"));
  let created = 0;

  for (const c of data.categories) {
    if (await db.category.findUnique({ where: { slug: c.slug } })) continue;
    await db.category.create({ data: { slug: c.slug, name: c.name, description: c.description, image: c.image, order: c.order } });
    created++;
  }
  for (const c of data.categories.filter((c) => c.parent)) {
    const parent = await db.category.findUnique({ where: { slug: c.parent! } });
    const cat = await db.category.findUnique({ where: { slug: c.slug } });
    if (parent && cat && !cat.parentId) await db.category.update({ where: { id: cat.id }, data: { parentId: parent.id } });
  }

  const cats = Object.fromEntries((await db.category.findMany()).map((c) => [c.slug, c.id]));
  for (const [i, v] of data.vehicles.entries()) {
    if (await db.vehicle.findUnique({ where: { slug: v.slug } })) continue;
    await db.vehicle.create({
      data: {
        slug: v.slug, name: v.name, shortDescription: v.shortDescription, description: v.description, price: v.price,
        characteristics: v.characteristics, images: v.images, featured: v.featured, published: v.published, order: i,
        categories: { create: v.categories.filter((s) => cats[s]).map((s) => ({ categoryId: cats[s] })) },
      },
    });
    created++;
  }

  for (const p of data.projects) {
    if (await db.project.findUnique({ where: { slug: p.slug } })) continue;
    await db.project.create({ data: { slug: p.slug, title: p.title, description: p.description, image: p.image, date: p.date, published: p.published } });
    created++;
  }
  for (const a of data.articles) {
    if (await db.article.findUnique({ where: { slug: a.slug } })) continue;
    await db.article.create({
      data: { slug: a.slug, title: a.title, content: a.content, excerpt: a.excerpt, image: a.image, publishedAt: new Date(a.publishedAt) },
    });
    created++;
  }
  for (const [key, value] of Object.entries(data.settings)) {
    if (await db.siteSetting.findUnique({ where: { key } })) continue;
    await db.siteSetting.create({ data: { key, value: JSON.stringify(value) } });
  }

  console.log(`Import terminé : ${created} élément(s) créé(s).`);
}

main().finally(() => db.$disconnect());

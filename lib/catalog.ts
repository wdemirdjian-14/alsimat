import { cache } from "react";
import { db } from "./db";
import type { CategoryNode, VehicleWithCats } from "./specs";

export * from "./specs";

const vehicleInclude = { categories: { include: { category: true } } } as const;

export const getCategoryTree = cache(async (): Promise<CategoryNode[]> => {
  const cats = await db.category.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { vehicles: { where: { vehicle: { published: true } } } } } },
  });
  return cats
    .filter((c) => !c.parentId)
    .map(({ _count, ...c }) => ({
      ...c,
      vehicleCount: _count.vehicles,
      children: cats.filter((x) => x.parentId === c.id).map(({ _count: _, ...x }) => x),
    }));
});

export const getCategory = cache(async (slug: string) =>
  db.category.findFirst({
    where: { slug, published: true },
    include: {
      parent: true,
      children: { where: { published: true }, orderBy: [{ order: "asc" }, { name: "asc" }] },
    },
  }),
);

export const getVehiclesInCategory = cache(
  async (categoryId: string): Promise<VehicleWithCats[]> =>
    db.vehicle.findMany({
      where: { published: true, categories: { some: { categoryId } } },
      include: vehicleInclude,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
    }),
);

export const getVehicle = cache(async (slug: string) =>
  db.vehicle.findFirst({ where: { slug, published: true }, include: vehicleInclude }),
);

export const getAllVehicles = cache(
  async (): Promise<VehicleWithCats[]> =>
    db.vehicle.findMany({ where: { published: true }, include: vehicleInclude, orderBy: [{ order: "asc" }, { name: "asc" }] }),
);

export async function getFeaturedVehicles(limit = 8): Promise<VehicleWithCats[]> {
  const featured = await db.vehicle.findMany({
    where: { published: true, featured: true, categories: { some: {} } },
    include: vehicleInclude,
    orderBy: { order: "asc" },
    take: limit,
  });
  if (featured.length >= 4) return featured;
  // À défaut de modèles mis en avant : un modèle par famille (Link, Atlas, Urban…).
  const all = await getAllVehicles();
  const seen = new Set(featured.map((v) => v.id));
  const families = new Set<string>();
  const picks = [...featured];
  for (const v of all) {
    const family = v.name.split(" ")[0].toLowerCase();
    if (seen.has(v.id) || families.has(family) || !v.images.length) continue;
    families.add(family);
    picks.push(v);
    if (picks.length >= limit) break;
  }
  return picks;
}

export async function getRelatedVehicles(v: VehicleWithCats, limit = 4): Promise<VehicleWithCats[]> {
  const catIds = v.categories.map((c) => c.categoryId);
  const family = v.name.split(" ")[0];
  const candidates = await db.vehicle.findMany({
    where: { published: true, id: { not: v.id }, categories: { some: { categoryId: { in: catIds } } } },
    include: vehicleInclude,
    orderBy: { order: "asc" },
  });
  const score = (c: VehicleWithCats) =>
    (c.name.startsWith(family) ? 3 : 0) + c.categories.filter((x) => catIds.includes(x.categoryId)).length;
  return candidates.sort((a, b) => score(b) - score(a)).slice(0, limit);
}

/** Catégorie « principale » d'un véhicule pour le fil d'Ariane (la plus spécifique). */
export function primaryCategory(v: VehicleWithCats) {
  const cats = v.categories.map((c) => c.category);
  return cats.find((c) => c.parentId) ?? cats.find((c) => c.slug !== "golfette-utilitaire") ?? cats[0] ?? null;
}

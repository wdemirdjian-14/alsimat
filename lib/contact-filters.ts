import type { Prisma } from "@prisma/client";

/** Paramètres d'URL de la liste des contacts (partagés avec l'export). */
export type ContactFilters = {
  q?: string; status?: string; segment?: string; tag?: string; list?: string;
  cat?: string; region?: string; dep?: string; stars?: string; size?: string; tel?: string; reach?: string;
};
export const FILTER_KEYS = ["q", "status", "segment", "tag", "list", "cat", "region", "dep", "stars", "size", "tel", "reach"] as const;

export const NO_CATEGORY = "aucune";

export function contactWhere(f: ContactFilters): Prisma.ContactWhereInput {
  const cats = (f.cat ?? "").split(",").filter(Boolean);
  const and: Prisma.ContactWhereInput[] = [];
  if (f.q) and.push({ OR: ["email", "firstName", "lastName", "company", "city", "phone", "postalCode"].map((k) => ({ [k]: { contains: f.q, mode: "insensitive" } })) });
  if (cats.length) {
    const named = cats.filter((c) => c !== NO_CATEGORY);
    and.push({ OR: [...(named.length ? [{ category: { in: named } }] : []), ...(cats.includes(NO_CATEGORY) ? [{ category: null }] : [])] });
  }
  return {
    AND: and,
    ...(f.status ? { status: f.status } : {}),
    ...(f.segment ? { segment: f.segment } : {}),
    ...(f.tag ? { tags: { has: f.tag } } : {}),
    ...(f.list ? { lists: { some: { listId: f.list } } } : {}),
    ...(f.region ? { region: f.region } : {}),
    ...(f.dep ? { department: f.dep } : {}),
    ...(f.stars ? { stars: Number(f.stars) } : {}),
    ...(f.size ? { size: f.size } : {}),
    ...(f.tel ? { phone: { not: null } } : {}),
    ...(f.reach ? { unsubscribed: false, bounced: false } : {}),
  };
}

export const pickFilters = (sp: Record<string, string | undefined>) =>
  Object.fromEntries(FILTER_KEYS.filter((k) => sp[k]).map((k) => [k, sp[k]])) as ContactFilters;

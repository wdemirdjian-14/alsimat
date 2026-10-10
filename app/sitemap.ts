import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSections } from "@/lib/nav";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, vehicles, sections] = await Promise.all([
    db.category.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, parentId: true } }),
    db.vehicle.findMany({ where: { published: true, categories: { some: {} } }, select: { slug: true, updatedAt: true, images: true } }),
    getSections(),
  ]);
  const [articles, used] = await Promise.all([
    sections.conseils ? db.article.findMany({ where: { published: true, publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true, image: true } }) : [],
    sections.occasion ? db.usedVehicle.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }) : [],
  ]);
  const latest = [...vehicles, ...cats].reduce((d, x) => (x.updatedAt > d ? x.updatedAt : d), new Date(0));
  const u = (path: string) => SITE_URL + path;

  return [
    { url: u("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    ...cats.map((c) => ({ url: u(`/gammes/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: c.parentId ? 0.8 : 0.9 })),
    ...vehicles.map((v) => ({ url: u(`/vehicules/${v.slug}`), lastModified: v.updatedAt, changeFrequency: "monthly" as const, priority: 0.8, images: v.images.map(u) })),
    { url: u("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: u("/sav"), changeFrequency: "yearly", priority: 0.5 },
    { url: u("/a-propos"), changeFrequency: "yearly", priority: 0.5 },
    ...(sections.conseils ? [{ url: u("/conseils"), changeFrequency: "weekly" as const, priority: 0.6 }] : []),
    ...articles.map((a) => ({ url: u(`/conseils/${a.slug}`), lastModified: a.updatedAt, priority: 0.6, ...(a.image ? { images: [u(a.image)] } : {}) })),
    ...(sections.realisations ? [{ url: u("/realisations"), priority: 0.5 }] : []),
    ...(sections.promotions ? [{ url: u("/promotions"), changeFrequency: "weekly" as const, priority: 0.6 }] : []),
    ...(sections.occasion ? [{ url: u("/occasion"), changeFrequency: "weekly" as const, priority: 0.6 }] : []),
    ...used.map((v) => ({ url: u(`/occasion/${v.slug}`), lastModified: v.updatedAt, priority: 0.5 })),
    { url: u("/plan-du-site"), priority: 0.2 },
  ];
}

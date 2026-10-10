import { cache } from "react";
import { getCategoryTree } from "./catalog";
import { db } from "./db";
import { getSetting } from "./settings";
import type { NavCategory, NavLink } from "@/components/site/header";

/** Rubriques visibles : activées dans les paramètres ET ayant du contenu publié. */
export const getSections = cache(async () => {
  const [visibility, used, promos, projects, articles] = await Promise.all([
    getSetting("visibility"),
    db.usedVehicle.count({ where: { published: true } }),
    db.promotion.count({ where: { active: true, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } }),
    db.project.count({ where: { published: true } }),
    db.article.count({ where: { published: true, publishedAt: { lte: new Date() } } }),
  ]);
  return {
    occasion: visibility.occasion && used > 0,
    promotions: visibility.promotions && promos > 0,
    realisations: visibility.realisations && projects > 0,
    conseils: visibility.conseils && articles > 0,
  };
});

export const getNav = cache(async () => {
  const [tree, sections] = await Promise.all([getCategoryTree(), getSections()]);
  const categories: NavCategory[] = tree.map((c) => ({
    name: c.name,
    slug: c.slug,
    image: c.image,
    description: c.description,
    children: c.children.map((s) => ({ name: s.name, slug: s.slug })),
  }));
  const links: NavLink[] = [
    sections.promotions && { href: "/promotions", label: "Promotions" },
    sections.occasion && { href: "/occasion", label: "Occasion" },
    sections.realisations && { href: "/realisations", label: "Réalisations" },
    sections.conseils && { href: "/conseils", label: "Conseils" },
    { href: "/a-propos", label: "À propos" },
    { href: "/sav", label: "SAV" },
    { href: "/contact", label: "Contact" },
  ].filter(Boolean) as NavLink[];
  return { categories, links, sections };
});

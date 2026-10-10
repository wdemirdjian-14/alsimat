import { cache } from "react";
import { db } from "./db";

const now = () => new Date();

export const getArticles = cache(() =>
  db.article.findMany({ where: { published: true, publishedAt: { lte: now() } }, orderBy: { publishedAt: "desc" } }),
);
export const getArticle = cache((slug: string) =>
  db.article.findFirst({ where: { slug, published: true, publishedAt: { lte: now() } } }),
);
export const getProjects = cache(() => db.project.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }));
export const getUsedVehicles = cache(() =>
  db.usedVehicle.findMany({ where: { published: true }, orderBy: [{ sold: "asc" }, { createdAt: "desc" }] }),
);
export const getUsedVehicle = cache((slug: string) => db.usedVehicle.findFirst({ where: { slug, published: true } }));
export const getPromotions = cache(() =>
  db.promotion.findMany({
    where: { active: true, OR: [{ endsAt: null }, { endsAt: { gt: now() } }] },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  }),
);

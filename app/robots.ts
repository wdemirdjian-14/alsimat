import type { MetadataRoute } from "next";
import { getSetting } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Indexation coupée dans l'admin (SEO) ou hors production : on interdit l'indexation.
  if (process.env.ALLOW_INDEXING === "false" || !(await getSetting("marketing")).indexing) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

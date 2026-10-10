import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "./json-ld";

export type Crumb = { name: string; href: string };

export function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  const all = [{ name: "Accueil", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Fil d'Ariane" className={light ? "text-white/70" : "text-ink/55"}>
        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />}
              {i < all.length - 1 ? (
                <Link href={c.href} className={light ? "hover:text-white" : "hover:text-brand-600"}>
                  {c.name}
                </Link>
              ) : (
                <span aria-current="page" className={light ? "text-white" : "text-ink"}>
                  {c.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: SITE_URL + c.href })),
        }}
      />
    </>
  );
}

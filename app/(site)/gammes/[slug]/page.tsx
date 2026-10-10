import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/site/catalog-browser";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { getCategory, getVehiclesInCategory, keySpecs } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { cn, paragraphs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) return {};
  const vehicles = await getVehiclesInCategory(cat.id);
  const prices = vehicles.map((v) => keySpecs(v).price).filter((p): p is number => !!p);
  const from = prices.length ? ` dès ${new Intl.NumberFormat("fr-FR").format(Math.min(...prices))} € HT` : "";
  return pageMetadata({
    title: cat.seoTitle || `${cat.name} : ${vehicles.length} modèles${from}`,
    description: cat.seoDescription || `${cat.description ?? cat.name} Comparez nos ${vehicles.length} modèles et demandez votre devis gratuit.`,
    path: `/gammes/${cat.slug}`,
    image: cat.image,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) notFound();
  const [vehicles, company] = await Promise.all([getVehiclesInCategory(cat.id), getCompany()]);

  // Navigation entre sous-gammes : enfants de la gamme, ou « frères » si l'on est déjà dans une sous-gamme.
  const parent = cat.parent ?? (cat.children.length ? cat : null);
  const siblings = cat.parent ? await getCategory(cat.parent.slug).then((p) => p?.children ?? []) : cat.children;

  return (
    <>
      <PageHero
        title={cat.name}
        subtitle={cat.description}
        eyebrow={`${vehicles.length} modèle${vehicles.length > 1 ? "s" : ""} électrique${vehicles.length > 1 ? "s" : ""}`}
        image={cat.image}
        crumbs={[...(cat.parent ? [{ name: cat.parent.name, href: `/gammes/${cat.parent.slug}` }] : []), { name: cat.name, href: `/gammes/${cat.slug}` }]}
      >
        {parent && siblings.length > 0 && (
          <nav aria-label="Sous-gammes" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
            <Link href={`/gammes/${parent.slug}`} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium backdrop-blur transition", parent.slug === cat.slug ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20")}>
              Tous les modèles
            </Link>
            {siblings.map((s) => (
              <Link key={s.slug} href={`/gammes/${s.slug}`} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium backdrop-blur transition", s.slug === cat.slug ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20")}>
                {s.name}
              </Link>
            ))}
          </nav>
        )}
      </PageHero>

      <section className="container-x py-12 lg:py-16">
        <CatalogBrowser vehicles={vehicles} />
      </section>

      {cat.intro && (
        <section className="container-x pb-8">
          <div className="prose-alsimat mx-auto max-w-3xl">
            {paragraphs(cat.intro).map((p, i) => (p.startsWith("## ") ? <h2 key={i}>{p.slice(3)}</h2> : <p key={i}>{p}</p>))}
          </div>
        </section>
      )}

      <CtaBand
        title="Besoin d'aide pour choisir ?"
        subtitle="Expliquez-nous votre usage : nous vous orientons vers le modèle adapté et vous envoyons un devis personnalisé."
        phone={company.phone}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: cat.name,
          url: `${SITE_URL}/gammes/${cat.slug}`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: vehicles.length,
            itemListElement: vehicles.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/vehicules/${v.slug}`, name: v.name })),
          },
        }}
      />
    </>
  );
}

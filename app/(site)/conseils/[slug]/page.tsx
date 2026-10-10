import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { Markdown, headingsOf } from "@/components/site/markdown";
import { getArticle } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { dateFr, slugify } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return {
    ...pageMetadata({ title: a.seoTitle || a.title, description: a.seoDescription || a.excerpt || a.content, path: `/conseils/${a.slug}`, image: a.image }),
    openGraph: { type: "article", publishedTime: a.publishedAt.toISOString(), modifiedTime: a.updatedAt.toISOString(), ...(a.image ? { images: [a.image] } : {}) },
  };
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  const company = await getCompany();
  const toc = headingsOf(a.content);
  const minutes = Math.max(1, Math.round(a.content.split(/\s+/).length / 220));
  return (
    <>
      <article className="pt-28 lg:pt-36">
        <header className="container-x max-w-4xl">
          <Breadcrumbs items={[{ name: "Conseils", href: "/conseils" }, { name: a.title, href: `/conseils/${a.slug}` }]} />
          <p className="mt-8 text-sm font-semibold text-brand-600">
            <time dateTime={a.publishedAt.toISOString()}>{dateFr(a.publishedAt)}</time> · {minutes} min de lecture
          </p>
          <h1 className="mt-3 animate-fade-up text-4xl font-extrabold sm:text-5xl">{a.title}</h1>
        </header>
        {a.image && (
          <div className="container-x mt-10 max-w-5xl">
            <div className="relative aspect-[16/8] overflow-hidden rounded-3xl">
              <Image src={a.image} alt={a.title} fill priority sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover" />
            </div>
          </div>
        )}
        <div className="container-x mt-12 grid max-w-6xl gap-12 lg:grid-cols-12">
          {toc.length > 2 && (
            <nav aria-label="Sommaire" className="lg:col-span-3">
              <div className="rounded-3xl bg-sand p-6 lg:sticky lg:top-32">
                <p className="text-sm font-bold">Sommaire</p>
                <ol className="mt-3 space-y-2 text-sm text-ink-soft">
                  {toc.map((t) => <li key={t}><a href={`#${slugify(t)}`} className="hover:text-brand-600">{t}</a></li>)}
                </ol>
              </div>
            </nav>
          )}
          <div className={toc.length > 2 ? "lg:col-span-9" : "lg:col-span-12 mx-auto max-w-3xl"}>
            <Markdown text={a.content} className="prose-alsimat text-lg [&_h2]:scroll-mt-32" />
            <p className="mt-10"><Link href="/conseils" className="font-semibold text-brand-600">← Tous les conseils</Link></p>
          </div>
        </div>
      </article>
      <CtaBand title="Besoin d'un avis personnalisé ?" subtitle="Expliquez-nous votre usage, nous vous recommandons le modèle adapté." phone={company.phone} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          image: a.image ? [SITE_URL + a.image] : undefined,
          datePublished: a.publishedAt.toISOString(),
          dateModified: a.updatedAt.toISOString(),
          author: { "@type": "Organization", name: "Alsimat", url: SITE_URL },
          publisher: { "@id": `${SITE_URL}/#organization` },
          mainEntityOfPage: `${SITE_URL}/conseils/${a.slug}`,
        }}
      />
    </>
  );
}

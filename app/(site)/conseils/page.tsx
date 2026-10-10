import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { getArticles } from "@/lib/content";
import { getSections } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import { dateFr, truncate } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Conseils & guides golfette électrique",
  description: "Nos guides pour bien choisir, utiliser et entretenir votre golfette électrique : nombre de places, autonomie, homologation, usage professionnel.",
  path: "/conseils",
});

export default async function ConseilsPage() {
  if (!(await getSections()).conseils) notFound();
  const articles = await getArticles();
  return (
    <>
      <PageHero title="Conseils & guides" subtitle="Bien choisir, utiliser et entretenir votre golfette électrique." crumbs={[{ name: "Conseils", href: "/conseils" }]} />
      <section className="container-x grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:py-20">
        {articles.map((a, i) => (
          <Link key={a.id} href={`/conseils/${a.slug}`} data-reveal style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as React.CSSProperties} className="group card-lift overflow-hidden rounded-3xl border border-ink/5 bg-white">
            <span className="relative block aspect-[16/10] overflow-hidden bg-sand">
              {a.image && <Image src={a.image} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />}
            </span>
            <span className="block p-6">
              <time dateTime={a.publishedAt.toISOString()} className="text-xs font-semibold tracking-wide text-brand-600 uppercase">{dateFr(a.publishedAt)}</time>
              <span className="mt-2 block font-display text-xl font-bold group-hover:text-brand-600">{a.title}</span>
              <span className="mt-2 block text-sm text-ink-soft">{truncate(a.excerpt || a.content.replace(/##+ /g, ""), 150)}</span>
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}

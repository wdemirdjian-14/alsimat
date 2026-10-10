import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { getPromotions } from "@/lib/content";
import { getSections } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import { dateFr, paragraphs } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Promotions golfettes électriques",
  description: "Les offres du moment sur les golfettes et véhicules électriques Alsimat. Profitez-en avant la fin de l'offre.",
  path: "/promotions",
});

export default async function PromotionsPage() {
  if (!(await getSections()).promotions) notFound();
  const promos = await getPromotions();
  return (
    <>
      <PageHero title="Promotions" subtitle="Les offres du moment sur nos véhicules électriques." crumbs={[{ name: "Promotions", href: "/promotions" }]} />
      <section className="container-x grid gap-6 py-14 md:grid-cols-2 lg:py-20">
        {promos.map((p, i) => (
          <article key={p.id} data-reveal style={{ "--reveal-delay": `${(i % 2) * 80}ms` } as React.CSSProperties} className="group card-lift flex flex-col overflow-hidden rounded-3xl border border-ink/5 bg-white">
            <div className="relative aspect-[16/9] overflow-hidden bg-sand">
              {p.image && <Image src={p.image} alt={p.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />}
              {(p.badge || p.discount) && (
                <span className="absolute top-4 left-4 rounded-full bg-brand-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">{p.discount || p.badge}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-7">
              <h2 className="text-2xl font-extrabold">{p.title}</h2>
              <div className="mt-3 text-ink-soft">{paragraphs(p.description).map((t, j) => <p key={j} className="mb-2">{t}</p>)}</div>
              {p.endsAt && <p className="mt-2 text-sm font-semibold text-brand-700">Jusqu'au {dateFr(p.endsAt)}</p>}
              <Link href={p.ctaLink || "/contact"} className="btn-primary mt-6 self-start">{p.ctaLabel || "J'en profite"}</Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { getUsedVehicles } from "@/lib/content";
import { getSections } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Golfettes électriques d'occasion",
  description: "Golfettes et véhicules électriques d'occasion contrôlés par Alsimat : prix, année, état et heures d'utilisation. Demandez votre devis.",
  path: "/occasion",
});

export default async function OccasionPage() {
  if (!(await getSections()).occasion) notFound();
  const list = await getUsedVehicles();
  return (
    <>
      <PageHero title="Véhicules d'occasion" subtitle="Des golfettes et véhicules électriques d'occasion contrôlés par notre atelier." crumbs={[{ name: "Occasion", href: "/occasion" }]} />
      <section className="container-x grid gap-5 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:py-20">
        {list.map((v, i) => (
          <article key={v.id} data-reveal style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties} className="group card-lift relative overflow-hidden rounded-3xl border border-ink/5 bg-white">
            <div className="relative aspect-[4/3] overflow-hidden bg-sand">
              {v.images[0] && <Image src={v.images[0]} alt={`${v.name} d'occasion`} fill sizes="(min-width: 1024px) 33vw, 50vw" className={`object-cover transition duration-700 group-hover:scale-105 ${v.sold ? "grayscale" : ""}`} />}
              {v.sold && <span className="absolute top-4 left-4 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">Vendu</span>}
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold"><Link href={`/occasion/${v.slug}`} className="after:absolute after:inset-0">{v.name}</Link></h2>
              <p className="mt-1 text-sm text-ink-soft">{[v.year, v.mileage, v.condition].filter(Boolean).join(" · ")}</p>
              <p className="mt-4 text-lg font-bold">{formatPrice(v.price)}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

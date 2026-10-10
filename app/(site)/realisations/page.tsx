import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { getProjects } from "@/lib/content";
import { getSections } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { paragraphs } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Nos réalisations – golfettes et véhicules électriques livrés",
  description: "Découvrez les projets livrés par Alsimat : golfettes électriques pour hôtels, campings, collectivités, sites industriels et établissements de santé.",
  path: "/realisations",
});

export default async function RealisationsPage() {
  if (!(await getSections()).realisations) notFound();
  const [projects, company] = await Promise.all([getProjects(), getCompany()]);
  return (
    <>
      <PageHero title="Nos réalisations" subtitle="Ils ont choisi Alsimat pour équiper leur site en véhicules électriques." crumbs={[{ name: "Réalisations", href: "/realisations" }]} />
      <section className="container-x space-y-16 py-16 lg:space-y-24 lg:py-24">
        {projects.map((p, i) => (
          <article key={p.id} data-reveal className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
              {p.image && <Image src={p.image} alt={p.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />}
            </div>
            <div>
              <p className="flex items-center gap-3 text-sm font-semibold text-brand-600">
                {p.date && <span>{p.date}</span>}
                {p.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden /> {p.location}</span>}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold">{p.title}</h2>
              <div className="prose-alsimat mt-5">{paragraphs(p.description).map((t, j) => <p key={j}>{t}</p>)}</div>
            </div>
          </article>
        ))}
      </section>
      <CtaBand title="Votre site est le prochain ?" subtitle="Parlez-nous de votre projet d'équipement." phone={company.phone} />
    </>
  );
}

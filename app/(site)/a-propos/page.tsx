import Image from "next/image";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { pageMetadata } from "@/lib/seo";
import { getCompany, getSetting } from "@/lib/settings";
import { paragraphs } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "À propos d'Alsimat – spécialiste de la golfette électrique",
  description: "Alsimat conseille, livre et entretient des golfettes et véhicules électriques pour les professionnels, collectivités et particuliers. Découvrez notre approche.",
  path: "/a-propos",
});

export default async function AboutPage() {
  const [about, company] = await Promise.all([getSetting("about_content"), getCompany()]);
  return (
    <>
      <PageHero title={about.title} subtitle={about.intro} eyebrow="À propos" image={about.image || "/media/golfette-electrique-tracker-4-flex.webp"} crumbs={[{ name: "À propos", href: "/a-propos" }]} />
      <section className="container-x grid gap-14 py-16 lg:grid-cols-12 lg:py-24">
        <div className="prose-alsimat text-lg lg:col-span-7">
          {paragraphs(about.body).map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="grid grid-cols-2 gap-4 self-start lg:col-span-5">
          {about.stats.filter((s) => s.value).map((s, i) => (
            <div key={i} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties} className="rounded-3xl bg-sand p-6">
              <p className="font-display text-4xl font-extrabold text-brand-500">{s.value}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container-x">
        <div className="grid gap-4 sm:grid-cols-3">
          {["/media/golfette-electrique-urban-4.webp", "/media/bus-electrique-shuttle-11.webp", "/media/golfette-electrique-roadland-6-flex.webp"].map((src, i) => (
            <div key={src} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties} className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image src={src} alt="Véhicule électrique Alsimat" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-700 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>
      <CtaBand title="Parlons de votre projet" subtitle="Nos conseillers vous aident à choisir le véhicule adapté à votre activité." phone={company.phone} />
    </>
  );
}

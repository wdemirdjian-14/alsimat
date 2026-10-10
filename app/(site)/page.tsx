import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BatteryCharging, Building2, Flag, HeartPulse, Leaf, MessagesSquare, Palette, Tent, Truck, Users, Wrench,
} from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { Faq, type FaqItem } from "@/components/site/faq";
import { VehicleCard } from "@/components/site/vehicle-card";
import { getAllVehicles, getCategoryTree, getFeaturedVehicles, keySpecs } from "@/lib/catalog";
import { db } from "@/lib/db";
import { getNav } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import { getCompany, getSetting } from "@/lib/settings";
import { dateFr } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Golfette électrique professionnelle & véhicules électriques | Alsimat",
  absoluteTitle: true,
  description:
    "Golfettes électriques 2 à 8 places, utilitaires, tout-terrain, homologuées route, PMR et bus électriques jusqu'à 29 places. Conseil, devis personnalisé, livraison et SAV sur site avec Alsimat.",
  path: "/",
});

const USES = [
  { icon: Tent, title: "Hôtellerie & campings", text: "Navettes clients, bagagerie, entretien des allées.", href: "/gammes/transport-de-personnes", image: "/media/golfette-electrique-link-4-flex.webp" },
  { icon: Flag, title: "Golfs & domaines", text: "Déplacements silencieux sur de grands espaces privés.", href: "/gammes/transport-de-personnes", image: "/media/golfette-electrique-link-6.webp" },
  { icon: Building2, title: "Collectivités", text: "Espaces verts, voirie, services techniques.", href: "/gammes/utilitaires", image: "/media/golfette-electrique-city-2-box.webp" },
  { icon: Truck, title: "Industrie & logistique", text: "Transport de matériel et d'outillage sur site.", href: "/gammes/utilitaires", image: "/media/golfette-electrique-atlas-2-cargo-xl.webp" },
  { icon: HeartPulse, title: "Santé & PMR", text: "Transport médical et accès aux personnes à mobilité réduite.", href: "/gammes/medical-pmr", image: "/media/golfette-electrique-access-4-pmr.webp" },
  { icon: Users, title: "Tourisme & événements", text: "Bus et navettes électriques jusqu'à 29 places.", href: "/gammes/bus", image: "/media/bus-electrique-shuttle-8.webp" },
];

const PROMISES = [
  { icon: MessagesSquare, title: "Conseil sur mesure", text: "Nous partons de votre usage réel pour recommander le bon modèle, ni plus, ni moins." },
  { icon: Palette, title: "Personnalisation", text: "Coloris de carrosserie, sellerie, ridelles, options : votre véhicule à vos couleurs." },
  { icon: BatteryCharging, title: "Lithium garanti 5 ans", text: "Batteries Lithium sans entretien, jusqu'à 100 km d'autonomie selon les modèles." },
  { icon: Wrench, title: "SAV sur site", text: "Entretien, diagnostic et suivi directement chez vous, sans immobiliser votre activité." },
];

const FAQ: FaqItem[] = [
  { q: "Faut-il un permis pour conduire une golfette électrique ?", a: "Sur voie privée (golf, camping, site industriel, domaine), les golfettes non homologuées se conduisent sans permis. Pour circuler sur la voie publique, il faut un modèle homologué route : nos gammes City, Urban et Roadland se conduisent alors avec le permis B." },
  { q: "Quelle est l'autonomie d'une golfette électrique ?", a: "Nos golfettes équipées de batteries Lithium offrent jusqu'à 90 à 110 km d'autonomie selon le modèle, la charge transportée et le terrain. Les batteries Lithium sont garanties 5 ans." },
  { q: "Golfette 2, 4, 6 ou 8 places : comment choisir ?", a: "Le nombre de places dépend de votre usage quotidien, mais pensez aussi au chargement : les versions Flex disposent d'une banquette arrière réversible qui se transforme en plateau, les versions Cargo d'une benne. Nos conseillers vous aident à trouver le bon compromis." },
  { q: "Assurez-vous l'entretien et le service après-vente ?", a: "Oui. Le SAV Alsimat intervient directement sur site pour l'entretien, le diagnostic et le suivi de votre véhicule. Vous pouvez ouvrir une demande à tout moment depuis notre formulaire SAV." },
  { q: "Les prix affichés sont-ils définitifs ?", a: "Les prix sont indiqués hors taxes, en version de base. Le tarif final dépend des options, de la personnalisation et des conditions de livraison : demandez un devis gratuit et sans engagement." },
];

export default async function HomePage() {
  const [home, company, tree, featured, all, { sections }] = await Promise.all([
    getSetting("home_content"),
    getCompany(),
    getCategoryTree(),
    getFeaturedVehicles(8),
    getAllVehicles(),
    getNav(),
  ]);
  const article = sections.conseils
    ? await db.article.findFirst({ where: { published: true, publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" } })
    : null;

  const gammes = tree
    .flatMap((c) => [c, ...c.children.map((s) => ({ ...s, children: [], vehicleCount: 0 }))])
    .filter((c) => c.image);
  const specs = all.filter((v) => v.categories.length).map(keySpecs);
  const minPrice = Math.min(...specs.map((s) => s.price ?? Infinity));
  const maxSeats = Math.max(...specs.map((s) => s.seats ?? 0));
  const maxRange = Math.max(...specs.map((s) => s.rangeKm ?? 0));
  const stats = [
    { value: String(specs.length), label: "modèles électriques" },
    { value: `${maxSeats}`, label: "places jusqu'à" },
    { value: `${maxRange} km`, label: "d'autonomie jusqu'à" },
    { value: "5 ans", label: "garantie batterie Lithium" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-ink pt-36 pb-16 text-white sm:pb-24">
        <Image
          src={home.heroImage}
          alt="Golfette électrique Alsimat en situation"
          fill
          priority
          sizes="100vw"
          className="-z-20 animate-ken-burns object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />
        <div className="container-x">
          <p className="eyebrow animate-fade-up text-brand-300">{home.heroEyebrow}</p>
          <h1 className="mt-5 max-w-4xl animate-fade-up text-5xl leading-[1.02] font-extrabold [animation-delay:100ms] sm:text-6xl lg:text-7xl">
            {home.heroTitle}{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent">{home.heroHighlight}</span>
          </h1>
          <p className="mt-6 max-w-2xl animate-fade-up text-lg text-white/85 [animation-delay:200ms] sm:text-xl">{home.heroSubtitle}</p>
          <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]">
            <Link href="#gammes" className="btn-primary !px-7 !py-4 text-base">
              Découvrir nos gammes <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link href="/contact" className="btn-light !px-7 !py-4 text-base">Demander un devis</Link>
          </div>
          {Number.isFinite(minPrice) && (
            <p className="mt-6 animate-fade-up text-sm text-white/70 [animation-delay:400ms]">
              Golfettes électriques à partir de{" "}
              <strong className="text-white">{new Intl.NumberFormat("fr-FR").format(minPrice)} € HT</strong>
            </p>
          )}
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="relative z-10 -mt-px bg-ink text-white">
        <div className="container-x grid grid-cols-2 gap-px overflow-hidden border-t border-white/10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties} className="py-8 lg:py-10">
              <p className="font-display text-4xl font-extrabold text-brand-300 sm:text-5xl">{s.value}</p>
              <p className="mt-1 text-sm text-white/65">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GAMMES */}
      <section id="gammes" className="container-x scroll-mt-24 py-20 lg:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div data-reveal>
            <p className="eyebrow">Catalogue</p>
            <h2 className="section-title mt-3">{home.gammesTitle}</h2>
            <p className="mt-3 max-w-xl text-lg text-ink-soft">{home.gammesSubtitle}</p>
          </div>
        </div>
        <div className="mt-12 grid auto-rows-[260px] gap-4 sm:grid-cols-2 lg:auto-rows-[300px] lg:grid-cols-4">
          {gammes.map((c, i) => (
              <Link
                key={c.slug}
                href={`/gammes/${c.slug}`}
                data-reveal
                style={{ "--reveal-delay": `${(i % 4) * 70}ms` } as React.CSSProperties}
                className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-3xl p-6 text-white ${
                  i === 0 ? "sm:col-span-2 sm:row-span-2" : i === 1 || (i === gammes.length - 1 && (gammes.length - 4) % 4 === 3) ? "lg:col-span-2" : ""
                }`}
              >
                <Image
                  src={c.image!}
                  alt={c.name}
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="-z-20 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent transition-opacity group-hover:opacity-90" />
                <h3 className={`font-extrabold ${i === 0 ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{c.name}</h3>
                {i === 0 && c.description && <p className="mt-2 max-w-md text-white/80">{c.description}</p>}
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-200">
                  Voir la gamme <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* USAGES */}
      <section className="bg-sand py-20 lg:py-28">
        <div className="container-x">
          <div data-reveal className="max-w-2xl">
            <p className="eyebrow">Par usage</p>
            <h2 className="section-title mt-3">Une golfette électrique pour chaque métier</h2>
            <p className="mt-3 text-lg text-ink-soft">Dites-nous ce que le véhicule devra faire au quotidien, nous vous orientons vers la bonne gamme.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USES.map((u, i) => (
              <Link
                key={u.title}
                href={u.href}
                data-reveal
                style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as React.CSSProperties}
                className="group card-lift flex items-center gap-5 overflow-hidden rounded-3xl bg-white p-3 pr-5"
              >
                <span className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={u.image} alt="" fill sizes="112px" className="object-cover transition duration-700 group-hover:scale-110" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                    <u.icon className="h-5 w-5 shrink-0 text-brand-500" aria-hidden /> {u.title}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{u.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MODÈLES PHARES */}
      {featured.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div data-reveal>
              <p className="eyebrow">Sélection</p>
              <h2 className="section-title mt-3">Nos modèles phares</h2>
            </div>
            <Link href="/gammes/golfette-utilitaire" className="btn-ghost self-start text-ink sm:self-auto">
              Tout le catalogue <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-6 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            {featured.map((v, i) => (
              <div key={v.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[23.5%]">
                <VehicleCard vehicle={v} delay={(i % 4) * 70} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ENGAGEMENTS */}
      <section className="relative overflow-hidden bg-ink py-20 text-white lg:py-28">
        <Leaf className="absolute -right-20 -bottom-20 h-96 w-96 rotate-12 text-white/[0.03]" aria-hidden />
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-5">
            <p className="eyebrow text-brand-300">Pourquoi Alsimat</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Du conseil au service après-vente, un seul interlocuteur.</h2>
            <p className="mt-5 text-lg text-white/70">
              Choisir une golfette électrique, c'est d'abord répondre à un besoin précis. Nous vous accompagnons à chaque étape, puis dans la durée.
            </p>
            <Link href="/a-propos" className="btn-light mt-8">Découvrir Alsimat</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {PROMISES.map((p, i) => (
              <div
                key={p.title}
                data-reveal
                style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-brand-400/40 hover:bg-white/[0.07]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-300">
                  <p.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-white/65">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÉTAPES */}
      <section className="container-x py-20 lg:py-28">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Comment ça marche</p>
          <h2 className="section-title mt-3">Votre projet en 4 étapes</h2>
        </div>
        <ol className="relative mt-14 grid gap-8 md:grid-cols-4">
          <div className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 md:block" aria-hidden />
          {[
            ["Votre besoin", "Usage, terrain, nombre de places, chargement : on fait le point ensemble."],
            ["Devis personnalisé", "Modèle, options et personnalisation, avec un prix clair."],
            ["Livraison", "Votre véhicule est livré prêt à l'emploi, avec prise en main."],
            ["Suivi & SAV", "Entretien et diagnostic sur site pendant toute la vie du véhicule."],
          ].map(([t, d], i) => (
            <li key={t} data-reveal style={{ "--reveal-delay": `${i * 100}ms` } as React.CSSProperties} className="relative text-center">
              <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-500 font-display text-xl font-extrabold text-white shadow-lg shadow-brand-500/30 ring-8 ring-white">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CONSEILS + FAQ */}
      <section className="bg-sand py-20 lg:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div data-reveal>
              <p className="eyebrow">Questions fréquentes</p>
              <h2 className="section-title mt-3">Tout savoir sur la golfette électrique</h2>
            </div>
            {article && (
              <Link href={`/conseils/${article.slug}`} data-reveal className="group card-lift mt-10 block overflow-hidden rounded-3xl bg-white">
                {article.image && (
                  <span className="relative block aspect-[16/9] overflow-hidden">
                    <Image src={article.image} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  </span>
                )}
                <span className="block p-6">
                  <span className="text-xs font-semibold tracking-wide text-brand-600 uppercase">Conseil · {dateFr(article.publishedAt)}</span>
                  <span className="mt-2 block font-display text-xl font-bold text-ink group-hover:text-brand-600">{article.title}</span>
                </span>
              </Link>
            )}
          </div>
          <div className="lg:col-span-7">
            <Faq items={FAQ} />
          </div>
        </div>
      </section>

      <CtaBand title={home.ctaTitle} subtitle={home.ctaSubtitle} phone={company.phone} />
    </>
  );
}

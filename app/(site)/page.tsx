import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { Faq, type FaqItem } from "@/components/site/faq";
import { HeroMoment, type MomentSlide } from "@/components/site/hero-moment";
import { IntroLoader, introGateScript } from "@/components/site/intro-loader";
import { MorphStory, type Chapter } from "@/components/site/morph-story";
import { VehicleCard } from "@/components/site/vehicle-card";
import { activePromo, getAllVehicles, getCategoryTree, getFeaturedVehicles, getMomentVehicles, getStockSummary, keySpecs, stockLabel } from "@/lib/catalog";
import { db } from "@/lib/db";
import { getNav } from "@/lib/nav";
import { vehicleKind } from "@/lib/product";
import { pageMetadata } from "@/lib/seo";
import { getCompany, getSetting } from "@/lib/settings";
import { dateFr, formatPrice } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Golfette électrique professionnelle & véhicules électriques | Alsimat",
  absoluteTitle: true,
  description:
    "Golfettes électriques 2 à 8 places, utilitaires, tout-terrain, homologuées route, PMR et bus électriques jusqu'à 29 places. Offres du moment, stock disponible, devis gratuit et SAV sur site partout en France.",
  path: "/",
});

const TICKER = [
  "SAV sur site partout en France",
  "Batteries Lithium garanties 5 ans",
  "Devis gratuit et sans engagement",
  "Golfettes, utilitaires & navettes électriques",
  "Modèles homologués route",
  "Coloris & sellerie personnalisables",
];

const FAQ: FaqItem[] = [
  { q: "Faut-il un permis pour conduire une golfette électrique ?", a: "Sur voie privée (golf, camping, site industriel, domaine), les golfettes non homologuées se conduisent sans permis. Pour circuler sur la voie publique, il faut un modèle homologué route : nos gammes City, Urban et Roadland se conduisent alors avec le permis B." },
  { q: "Quelle est l'autonomie d'une golfette électrique ?", a: "Nos golfettes équipées de batteries Lithium offrent jusqu'à 90 à 110 km d'autonomie selon le modèle, la charge transportée et le terrain. Les batteries Lithium sont garanties 5 ans." },
  { q: "Golfette 2, 4, 6 ou 8 places : comment choisir ?", a: "Le nombre de places dépend de votre usage quotidien, mais pensez aussi au chargement : les versions Flex disposent d'une banquette arrière réversible qui se transforme en plateau, les versions Cargo d'une benne. Nos conseillers vous aident à trouver le bon compromis." },
  { q: "Assurez-vous l'entretien et le service après-vente ?", a: "Oui. Le SAV Alsimat intervient directement sur site pour l'entretien, le diagnostic et le suivi de votre véhicule. Vous pouvez ouvrir une demande à tout moment depuis notre formulaire SAV." },
  { q: "Les prix affichés sont-ils définitifs ?", a: "Les prix sont indiqués hors taxes, en version de base. Le tarif final dépend des options, de la personnalisation et des conditions de livraison : demandez un devis gratuit et sans engagement." },
];

export default async function HomePage() {
  const [home, company, tree, featured, all, { sections }, moment, summary] = await Promise.all([
    getSetting("home_content"),
    getCompany(),
    getCategoryTree(),
    getFeaturedVehicles(8),
    getAllVehicles(),
    getNav(),
    getMomentVehicles(),
    getStockSummary(),
  ]);
  const article = sections.conseils
    ? await db.article.findFirst({ where: { published: true, publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" } })
    : null;

  const specs = all.filter((v) => v.categories.length).map(keySpecs);
  const maxSeats = Math.max(...specs.map((s) => s.seats ?? 0));
  const maxRange = Math.max(...specs.map((s) => s.rangeKm ?? 0));
  const stats = [
    { value: String(specs.length), label: "modèles électriques" },
    { value: `${maxSeats}`, label: "places jusqu'à" },
    { value: `${maxRange} km`, label: "d'autonomie jusqu'à" },
    { value: "5 ans", label: "garantie batterie Lithium" },
  ];

  const slides: MomentSlide[] = moment.map((v) => {
    const s = keySpecs(v);
    const promo = activePromo(v);
    return {
      slug: v.slug,
      name: v.name.trim(),
      kind: `${vehicleKind(v)}${s.seats ? ` · ${s.seats} places` : ""}`,
      tagline: v.tagline ?? v.shortDescription?.split(". ")[0] ?? "",
      image: v.images[0],
      price: formatPrice(v.price),
      promo: promo ? { price: formatPrice(promo.price), label: promo.label } : null,
      stock: stockLabel(v.stock),
      roadLegal: s.roadLegal,
      specs: [
        s.speedKmh && { value: String(s.speedKmh), unit: "km/h" },
        s.rangeKm && { value: String(s.rangeKm), unit: "km" },
        s.seats && { value: String(s.seats), unit: "places" },
      ].filter(Boolean) as { value: string; unit: string }[],
    };
  });

  const gammes = tree.flatMap((c) => [c, ...c.children.map((s) => ({ ...s, children: [], vehicleCount: 0 }))]).filter((c) => c.image);

  const chapters: Chapter[] = [
    {
      eyebrow: "Nos gammes",
      title: "Une gamme électrique pour chaque mission.",
      text: "Golfettes 2 à 8 places, utilitaires à benne, tout-terrain, modèles homologués route, véhicules PMR et navettes jusqu'à 29 places.",
      image: "/media/golfette-electrique-link-6.webp",
      links: tree.flatMap((c) => [c, ...c.children]).slice(0, 7).map((c) => ({ href: `/gammes/${c.slug}`, label: c.name })),
    },
    {
      eyebrow: "Par usage",
      title: "Hôtels, campings, collectivités, industrie, santé…",
      text: "Navettes clients, entretien des espaces verts, logistique sur site, transport médical : dites-nous ce que le véhicule doit faire, nous vous orientons vers le bon modèle.",
      image: "/media/golfette-electrique-link-2-cargo-benne-photo-1.webp",
      links: [
        { href: "/gammes/transport-de-personnes", label: "Transport de personnes" },
        { href: "/gammes/utilitaires", label: "Transport de matériel" },
        { href: "/gammes/medical-pmr", label: "Santé & PMR" },
        { href: "/gammes/bus", label: "Tourisme & événements" },
      ],
    },
    {
      eyebrow: "Énergie",
      title: "Lithium garanti 5 ans. Branchez le soir, roulez la journée.",
      text: "Batteries Lithium sans entretien, recharge à 85 % en 4 heures, et jusqu'à 110 km d'autonomie selon les modèles.",
      image: "/media/golfette-electrique-tracker-4-flex.webp",
      stats: [
        { value: `${maxRange} km`, label: "d'autonomie max" },
        { value: "4 h", label: "pour 85 % de charge" },
        { value: "5 ans", label: "de garantie" },
      ],
    },
    {
      eyebrow: "Service",
      title: "Du conseil au SAV, un seul interlocuteur.",
      text: "Conseil, devis personnalisé, livraison et prise en main, puis entretien et diagnostic directement sur site, partout en France.",
      image: "/media/utilitaire-electrique-street-2-cargo-homologue-route-profil.webp",
      links: [
        { href: "/contact", label: "Demander un devis" },
        { href: "/sav", label: "Service après-vente" },
        { href: "/a-propos", label: "Qui sommes-nous" },
      ],
    },
  ];

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
      <IntroLoader summary={summary} />

      <div id="moment" className="scroll-mt-0">
        <HeroMoment slides={slides} title={home.heroTitle} highlight={home.heroHighlight} subtitle={home.heroSubtitle} />
      </div>

      {/* BANDEAU DÉFILANT */}
      <div className="overflow-hidden border-y border-white/10 bg-brand-500 py-3 text-white" aria-hidden>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-3 font-display text-sm font-bold tracking-wide uppercase"><Zap className="h-4 w-4" />{t}</span>
          ))}
        </div>
      </div>

      {/* CHIFFRES CLÉS */}
      <section className="bg-ink text-white">
        <div className="container-x grid grid-cols-2 gap-px lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties} className="py-8 lg:py-10">
              <p className="font-display text-4xl font-extrabold text-brand-300 sm:text-5xl">{s.value}</p>
              <p className="mt-1 text-sm text-white/65">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DÉCOUVERTE EN MORPHING */}
      <MorphStory chapters={chapters} />

      {/* GAMMES */}
      <section id="gammes" className="container-x scroll-mt-24 py-20 lg:py-28">
        <div data-reveal>
          <p className="eyebrow">Catalogue</p>
          <h2 className="section-title mt-3">{home.gammesTitle}</h2>
          <p className="mt-3 max-w-xl text-lg text-ink-soft">{home.gammesSubtitle}</p>
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
              <Image src={c.image!} alt={c.name} fill sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} className="-z-20 object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <h3 className={`font-extrabold ${i === 0 ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{c.name}</h3>
              {i === 0 && c.description && <p className="mt-2 max-w-md text-white/80">{c.description}</p>}
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-200">
                Voir la gamme <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* MODÈLES PHARES */}
      {featured.length > 0 && (
        <section className="bg-sand py-20 lg:py-28">
          <div className="container-x flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div data-reveal>
              <p className="eyebrow">Sélection</p>
              <h2 className="section-title mt-3">Nos modèles phares</h2>
            </div>
            <Link href="/gammes/golfette-utilitaire" className="btn-ghost self-start text-ink sm:self-auto">Tout le catalogue <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-6 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            {featured.map((v, i) => (
              <div key={v.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[23.5%]"><VehicleCard vehicle={v} delay={(i % 4) * 70} /></div>
            ))}
          </div>
        </section>
      )}

      {/* CONSEILS + FAQ */}
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div data-reveal>
              <p className="eyebrow">Questions fréquentes</p>
              <h2 className="section-title mt-3">Tout savoir sur la golfette électrique</h2>
            </div>
            {article && (
              <Link href={`/conseils/${article.slug}`} data-reveal className="group card-lift mt-10 block overflow-hidden rounded-3xl border border-ink/5 bg-white">
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
          <div className="lg:col-span-7"><Faq items={FAQ} /></div>
        </div>
      </section>

      <CtaBand title={home.ctaTitle} subtitle={home.ctaSubtitle} phone={company.phone} />
    </>
  );
}

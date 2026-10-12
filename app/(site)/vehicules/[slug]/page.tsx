import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BatteryCharging, Check, Gauge, IdCard, Phone, ShieldCheck, Users, Wrench, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Gallery } from "@/components/site/gallery";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { VehicleShowcase } from "@/components/site/vehicle-showcase";
import { productFaq, productJsonLd } from "@/lib/product";
import { VehicleCard } from "@/components/site/vehicle-card";
import { getRelatedVehicles, getVehicle, keySpecs, primaryCategory, specsOf } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { telHref } from "@/lib/site";
import { formatPrice, paragraphs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

const isBus = (v: { categories: { category: { slug: string } }[] }) => v.categories.some((c) => c.category.slug === "bus");
const kind = (v: Parameters<typeof isBus>[0] & { vehicleType?: string | null }) => v.vehicleType || (isBus(v) ? "Bus électrique" : "Golfette électrique");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicle(slug);
  if (!v) return {};
  const s = keySpecs(v);
  const facts = [s.seats && `${s.seats} places`, s.rangeKm && `${s.rangeKm} km d'autonomie`, s.speedKmh && `${s.speedKmh} km/h`].filter(Boolean).join(", ");
  return pageMetadata({
    title: v.seoTitle || `${v.name.trim()} – ${kind(v)}${s.seats ? ` ${s.seats} places` : ""}${s.price ? ` dès ${new Intl.NumberFormat("fr-FR").format(s.price)} € HT` : ""}`,
    description: v.seoDescription || `${kind(v)} ${v.name.trim()}${facts ? ` : ${facts}` : ""}. ${v.shortDescription ?? ""}`,
    path: `/vehicules/${v.slug}`,
    image: v.images[0],
  });
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  const v = await getVehicle(slug);
  if (!v) notFound();
  const [related, company] = await Promise.all([getRelatedVehicles(v), getCompany()]);
  const s = keySpecs(v);
  const specs = specsOf(v);
  const cat = primaryCategory(v);
  const name = v.name.trim();
  const crumbs = [...(cat ? [{ name: cat.name, href: `/gammes/${cat.slug}` }] : []), { name, href: `/vehicules/${v.slug}` }];

  if (v.spotlight)
    return (
      <>
        <VehicleShowcase v={v} crumbs={crumbs} related={related} phone={company.phone} />
        <JsonLd data={productJsonLd(v, cat?.name)} />
      </>
    );

  const highlights = [
    s.seats && { icon: Users, label: "Places", value: `${s.seats}` },
    s.rangeKm && { icon: BatteryCharging, label: "Autonomie", value: `${s.rangeKm} km` },
    s.speedKmh && { icon: Gauge, label: "Vitesse max", value: `${s.speedKmh} km/h` },
    s.motor && { icon: Zap, label: "Moteur", value: s.motor.replace(/\s*-\s*[ée]lectrique/i, "") },
    s.licence && { icon: IdCard, label: "Permis", value: s.licence },
  ].filter(Boolean) as { icon: typeof Users; label: string; value: string }[];

  return (
    <>
      <div className="bg-sand pt-28 lg:pt-36">
        <div className="container-x">
          <Breadcrumbs items={crumbs} />
        </div>
        <section className="container-x grid gap-10 pt-6 pb-14 lg:grid-cols-12 lg:gap-14 lg:pb-20">
          <div className="animate-fade-up lg:col-span-7">
            <Gallery images={v.images} alt={`${kind(v)} ${name}`} />
          </div>
          <div className="animate-fade-up [animation-delay:120ms] lg:col-span-5">
            <div className="flex flex-wrap gap-2">
              {v.categories.map(({ category }) => (
                <Link key={category.id} href={`/gammes/${category.slug}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-soft hover:text-brand-600">
                  {category.name}
                </Link>
              ))}
            </div>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
              {name}
              <span className="mt-2 block text-lg font-semibold text-brand-600 sm:text-xl">{kind(v)}{s.seats ? ` ${s.seats} places` : ""}</span>
            </h1>
            {v.shortDescription && <p className="mt-5 text-lg leading-relaxed text-ink-soft">{v.shortDescription}</p>}

            {highlights.length > 0 && (
              <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(110px,1fr))]">
                {highlights.slice(0, 6).map((h) => (
                  <div key={h.label} className="rounded-2xl bg-white p-4">
                    <h.icon className="h-5 w-5 text-brand-500" aria-hidden />
                    <dt className="mt-2 text-xs text-ink/55">{h.label}</dt>
                    <dd className="font-display text-lg font-bold">{h.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 rounded-3xl bg-ink p-6 text-white">
              <p className="text-sm text-white/60">{s.price ? "Prix de base, à partir de" : "Tarif"}</p>
              <p className="font-display text-3xl font-extrabold">{formatPrice(v.price)}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a href="#devis" className="btn-primary">Demander un devis</a>
                <a href={telHref(company.phone)} className="btn-ghost text-white"><Phone className="h-4 w-4" aria-hidden /> {company.phone}</a>
              </div>
              <ul className="mt-5 space-y-1.5 text-sm text-white/70">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-300" aria-hidden /> Devis gratuit et sans engagement</li>
                <li className="flex items-center gap-2"><Wrench className="h-4 w-4 text-brand-300" aria-hidden /> SAV Alsimat sur site</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section className="container-x grid gap-14 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <h2 className="section-title !text-3xl">Présentation du {name}</h2>
          <div className="prose-alsimat mt-6">
            {paragraphs(v.description).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
        <aside className="lg:col-span-5">
          <div className="rounded-3xl border border-ink/10 p-6 lg:sticky lg:top-32">
            <h2 className="text-xl font-bold">Caractéristiques techniques</h2>
            <table className="mt-4 w-full text-sm">
              <tbody className="divide-y divide-ink/5">
                {Object.entries(specs).map(([k, val]) => (
                  <tr key={k}>
                    <th scope="row" className="py-3 pr-4 text-left font-medium text-ink/55">{k}</th>
                    <td className="py-3 text-right font-semibold">{val}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-ink/55">Prix</th>
                  <td className="py-3 text-right font-semibold">{formatPrice(v.price)}</td>
                </tr>
              </tbody>
            </table>
            <ul className="mt-6 space-y-2 text-sm text-ink-soft">
              {["Coloris de carrosserie au choix", "Sellerie personnalisable", "Livraison et prise en main"].map((t) => (
                <li key={t} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-brand-500" aria-hidden /> {t}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="container-x grid gap-12 pb-16 lg:grid-cols-12 lg:pb-24">
        <h2 className="section-title !text-3xl lg:col-span-4">Questions fréquentes</h2>
        <div className="lg:col-span-8"><Faq items={productFaq(v)} /></div>
      </section>

      <section id="devis" className="scroll-mt-28 bg-sand py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Devis gratuit</p>
            <h2 className="section-title mt-3 !text-3xl">Votre devis pour le {name}</h2>
            <p className="mt-4 text-ink-soft">Précisez votre usage et vos options souhaitées : nous vous répondons avec une offre personnalisée.</p>
          </div>
          <div className="rounded-3xl bg-white p-6 sm:p-8 lg:col-span-8">
            <InquiryForm type="devis" vehicleRef={name} compact />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x py-16 lg:py-24">
          <h2 className="section-title !text-3xl">Ces modèles peuvent aussi vous intéresser</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r, i) => <VehicleCard key={r.id} vehicle={r} delay={i * 60} />)}
          </div>
        </section>
      )}

      <JsonLd data={productJsonLd(v, cat?.name)} />
    </>
  );
}

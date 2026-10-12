import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, BatteryCharging, Check, Download, FileText, Gauge, MoveHorizontal, Package, Phone, ShieldCheck, Users, Wrench, Zap,
} from "lucide-react";
import { productFaq, groupedSpecs, vehicleKind } from "@/lib/product";
import { keySpecs, specsOf, type VehicleWithCats } from "@/lib/specs";
import { telHref } from "@/lib/site";
import { firstNumber, formatPrice, paragraphs } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { CountUp } from "./count-up";
import { Faq } from "./faq";
import { Gallery } from "./gallery";
import { InquiryForm } from "./inquiry-form";
import { Swatches } from "./swatches";
import { VehicleCard } from "./vehicle-card";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

/** Page produit « vitrine » : vidéo, chiffres animés, benne, batterie, personnalisation, fiche technique. */
export function VehicleShowcase({ v, crumbs, related, phone }: { v: VehicleWithCats; crumbs: Crumb[]; related: VehicleWithCats[]; phone: string }) {
  const s = keySpecs(v);
  const specs = specsOf(v);
  const name = v.name.trim();
  const find = (re: RegExp) => Object.entries(specs).find(([k]) => re.test(k))?.[1];
  const benneKg = firstNumber(find(/capacit.*benne/i));
  const benneDims = find(/dimensions de la benne/i)?.replace(/\s/g, "").match(/(\d+)×(\d+)×(\d+)/);
  const turning = firstNumber(find(/rayon/i));
  const motorKw = firstNumber(s.motor);
  const r85 = firstNumber(find(/recharge.*85/i));
  const r100 = firstNumber(find(/recharge.*100/i));
  const equipment = (v.equipment ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const paras = paragraphs(v.description);

  const numbers = [
    s.speedKmh && { value: s.speedKmh, unit: "km/h", label: "vitesse maximale", icon: Gauge },
    s.rangeKm && { value: s.rangeKm, unit: "km", label: "d'autonomie, et plus", icon: BatteryCharging },
    motorKw && { value: motorKw, unit: "kW", label: "moteur électrique AC", icon: Zap },
    benneKg && { value: benneKg, unit: "kg", label: "dans la benne", icon: Package },
    turning && { value: turning, unit: "m", label: "rayon de braquage", icon: MoveHorizontal },
    s.seats && !benneKg && { value: s.seats, unit: "places", label: "assises", icon: Users },
  ].filter(Boolean).slice(0, 5) as { value: number; unit: string; label: string; icon: typeof Gauge }[];

  return (
    <>
      {/* HERO VIDÉO */}
      <section data-dark-hero className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink pt-32 pb-14 text-white">
        {v.video ? (
          <video
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            src={v.video}
            poster={v.images[0]}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : (
          v.images[0] && <Image src={v.images[0]} alt="" fill priority sizes="100vw" className="-z-20 animate-ken-burns object-cover" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/30 to-transparent" />
        <div className="container-x">
          <Breadcrumbs items={crumbs} light />
          <p className="mt-8 flex animate-fade-up flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold tracking-wide uppercase">À la une</span>
            {v.sku && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">Réf. {v.sku}</span>}
          </p>
          <h1 className="mt-4 animate-fade-up text-5xl leading-none font-extrabold [animation-delay:80ms] sm:text-7xl lg:text-8xl">
            {name}
            <span className="mt-3 block text-xl font-semibold text-brand-300 sm:text-2xl">
              {vehicleKind(v)}{s.cargo ? " utilitaire" : ""}{s.seats ? ` ${s.seats} places` : ""}
            </span>
          </h1>
          {v.tagline && <p className="mt-6 max-w-2xl animate-fade-up text-lg text-white/85 [animation-delay:160ms] sm:text-xl">{v.tagline}</p>}
          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:240ms]">
            <a href="#devis" className="btn-primary !px-7 !py-4 text-base">Demander un devis</a>
            {v.datasheet && (
              <a href={v.datasheet} download className="btn-light !px-7 !py-4 text-base">
                <Download className="h-5 w-5" aria-hidden /> Fiche technique PDF
              </a>
            )}
            <p className="ml-1 text-white/80">
              {s.price && <span className="text-sm">à partir de </span>}
              <strong className="font-display text-2xl text-white">{formatPrice(v.price)}</strong>
            </p>
          </div>
          <a href="#decouvrir" aria-label="Découvrir" className="mt-12 hidden h-12 w-12 animate-bounce place-items-center rounded-full border border-white/30 sm:grid">
            <ArrowDown className="h-5 w-5" aria-hidden />
          </a>
        </div>
      </section>

      {/* CHIFFRES CLÉS ANIMÉS */}
      {numbers.length > 0 && (
        <section id="decouvrir" className="scroll-mt-20 bg-ink pb-16 text-white">
          <div className="container-x grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-3 lg:grid-cols-5">
            {numbers.map((n, i) => (
              <div key={n.label} data-reveal style={delay(i * 90)} className="bg-ink p-6 lg:p-8">
                <n.icon className="h-6 w-6 text-brand-300" aria-hidden />
                <p className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
                  <CountUp value={n.value} /> <span className="text-xl text-brand-300 sm:text-2xl">{n.unit}</span>
                </p>
                <p className="mt-1 text-sm text-white/60">{n.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRÉSENTATION + GALERIE */}
      <section className="container-x grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <div data-reveal className="lg:col-span-7">
          <Gallery images={v.images} alt={`${vehicleKind(v)} ${name}`} />
        </div>
        <div data-reveal style={delay(120)} className="lg:col-span-5">
          <p className="eyebrow">Présentation</p>
          <h2 className="section-title mt-3 !text-4xl">Pensée pour travailler, taillée pour durer.</h2>
          {v.shortDescription && <p className="mt-6 text-lg leading-relaxed text-ink-soft">{v.shortDescription}</p>}
          <ul className="mt-8 space-y-3">
            {[
              s.battery && `Batterie ${s.battery}`,
              s.range && `Autonomie : ${s.range.toLowerCase()}`,
              benneKg && `Benne de ${benneKg} kg${benneDims ? ` (${benneDims[1]} × ${benneDims[2]} mm)` : ""}`,
              "SAV Alsimat sur site, partout en France",
            ].filter(Boolean).map((t) => (
              <li key={t as string} className="flex gap-3"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-white"><Check className="h-4 w-4" aria-hidden /></span>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* BENNE */}
      {benneDims && (
        <section className="bg-sand py-20 lg:py-28">
          <div className="container-x grid items-center gap-14 lg:grid-cols-2">
            <div data-reveal>
              <p className="eyebrow">Capacité de chargement</p>
              <h2 className="section-title mt-3 !text-4xl">Une vraie benne, {benneKg ? `${benneKg} kg` : "grand volume"}.</h2>
              <p className="mt-5 text-lg text-ink-soft">
                {benneDims[1]} × {benneDims[2]} × {benneDims[3]} mm : outillage, déchets verts, linge, fournitures ou colis voyagent avec vous, en un seul trajet.
                {find(/charge max/i) && ` Charge totale admissible : ${find(/charge max/i)}.`}
              </p>
            </div>
            <figure data-reveal style={delay(150)} className="relative mx-auto w-full max-w-lg">
              <svg viewBox="0 0 460 300" className="benne-draw w-full" role="img" aria-label={`Benne de ${benneDims[1]} par ${benneDims[2]} par ${benneDims[3]} millimètres`}>
                <defs>
                  <linearGradient id="bt" x1="0" x2="1"><stop offset="0" stopColor="#46a584" stopOpacity=".25" /><stop offset="1" stopColor="#46a584" stopOpacity=".05" /></linearGradient>
                </defs>
                {/* boîte isométrique */}
                <path d="M60 140 L230 80 L380 130 L210 190 Z" fill="url(#bt)" stroke="#0d2420" strokeWidth="2.5" />
                <path d="M60 140 L60 200 L210 250 L210 190" fill="#0d2420" fillOpacity=".06" stroke="#0d2420" strokeWidth="2.5" />
                <path d="M210 250 L380 190 L380 130" fill="#0d2420" fillOpacity=".12" stroke="#0d2420" strokeWidth="2.5" />
                {/* cotes */}
                <g stroke="#46a584" strokeWidth="1.5" strokeDasharray="5 4">
                  <path d="M60 215 L210 265" /><path d="M222 262 L392 202" /><path d="M395 128 L395 188" />
                </g>
                <g fill="#225747" fontSize="15" fontWeight="700" fontFamily="var(--font-heading)">
                  <text x="105" y="270" transform="rotate(18 105 270)">{benneDims[1]} mm</text>
                  <text x="290" y="255" transform="rotate(-19 290 255)">{benneDims[2]} mm</text>
                  <text x="402" y="165">{benneDims[3]} mm</text>
                </g>
                {benneKg && (
                  <g>
                    <rect x="170" y="20" width="110" height="40" rx="20" fill="#46a584" />
                    <text x="225" y="46" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="var(--font-heading)">{benneKg} kg</text>
                  </g>
                )}
              </svg>
            </figure>
          </div>
        </section>
      )}

      {/* BATTERIE */}
      {(r85 || r100 || s.battery) && (
        <section className="container-x py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div data-reveal>
              <p className="eyebrow">Énergie</p>
              <h2 className="section-title mt-3 !text-4xl">Lithium, garanti 5 ans.</h2>
              <p className="mt-5 text-lg text-ink-soft">
                {s.battery ? `Batterie ${s.battery}. ` : ""}Sans entretien, plus légère et plus durable qu'une batterie plomb : branchez le soir, repartez le matin.
              </p>
            </div>
            <div data-reveal style={delay(150)} className="rounded-3xl bg-ink p-8 text-white">
              {[r85 && { pct: 85, h: r85 }, r100 && { pct: 100, h: r100 }].filter(Boolean).map((r) => {
                const { pct, h } = r as { pct: number; h: number };
                return (
                  <div key={pct} className="mb-6 last:mb-0">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-3xl font-extrabold">{pct} %</span>
                      <span className="text-white/70">en {h} h</span>
                    </div>
                    <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/10">
                      <div className="charge-bar h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300" style={{ "--w": `${pct}%` } as React.CSSProperties} />
                    </div>
                  </div>
                );
              })}
              <p className="mt-6 flex items-center gap-2 text-sm text-white/70"><ShieldCheck className="h-4 w-4 text-brand-300" aria-hidden /> Batterie Lithium garantie 5 ans</p>
            </div>
          </div>
        </section>
      )}

      {/* PERSONNALISATION */}
      {(v.colors.length > 0 || v.upholstery.length > 0) && (
        <section className="relative overflow-hidden bg-ink py-20 text-white lg:py-28">
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
          <div className="container-x grid gap-14 lg:grid-cols-12">
            <div data-reveal className="lg:col-span-5">
              <p className="eyebrow text-brand-300">Personnalisation</p>
              <h2 className="mt-3 text-4xl font-extrabold">À vos couleurs.</h2>
              <p className="mt-5 text-lg text-white/70">Carrosserie et sellerie se configurent selon l'identité de votre établissement ou de votre flotte.</p>
            </div>
            <div data-reveal style={delay(120)} className="grid gap-10 sm:grid-cols-2 lg:col-span-7">
              <Swatches title="Carrosserie" items={v.colors} />
              <Swatches title="Sellerie" items={v.upholstery} />
            </div>
          </div>
        </section>
      )}

      {/* ÉQUIPEMENT + FICHE TECHNIQUE */}
      <section className="container-x grid gap-14 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-5">
          {equipment.length > 0 && (
            <>
              <p className="eyebrow">Équipement de série</p>
              <h2 className="section-title mt-3 !text-4xl">Tout est déjà là.</h2>
              <ul className="mt-8 grid gap-3">
                {equipment.map((e, i) => (
                  <li key={e} data-reveal style={delay((i % 6) * 60)} className="flex items-center gap-3 rounded-2xl bg-sand px-4 py-3 font-medium">
                    <Check className="h-5 w-5 shrink-0 text-brand-500" aria-hidden /> {e}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Fiche technique</p>
              <h2 className="section-title mt-3 !text-4xl">Caractéristiques</h2>
            </div>
            {v.datasheet && (
              <a href={v.datasheet} download className="btn-ghost text-ink"><FileText className="h-4 w-4" aria-hidden /> Télécharger le PDF</a>
            )}
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {groupedSpecs(v).map((g, i) => (
              <div key={g.title} data-reveal style={delay(i * 80)} className="rounded-3xl border border-ink/10 p-6">
                <h3 className="text-sm font-bold tracking-wide text-brand-600 uppercase">{g.title}</h3>
                <table className="mt-3 w-full text-sm">
                  <tbody className="divide-y divide-ink/5">
                    {g.rows.map(([k, val]) => (
                      <tr key={k}><th scope="row" className="py-2.5 pr-3 text-left font-medium text-ink/55">{k}</th><td className="py-2.5 text-right font-semibold">{val}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESCRIPTION LONGUE */}
      {paras.length > 0 && (
        <section className="bg-sand py-20 lg:py-24">
          <div className="container-x max-w-3xl">
            <h2 className="section-title !text-3xl">Tout savoir sur le {name}</h2>
            <div className="prose-alsimat mt-8 text-lg">{paras.map((p, i) => <p key={i}>{p}</p>)}</div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="container-x grid gap-12 py-20 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-4">
          <p className="eyebrow">Questions fréquentes</p>
          <h2 className="section-title mt-3 !text-3xl">{name} : vos questions</h2>
        </div>
        <div className="lg:col-span-8"><Faq items={productFaq(v)} /></div>
      </section>

      {/* DEVIS */}
      <section id="devis" className="scroll-mt-24 bg-ink py-20 text-white lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-brand-300">Devis gratuit</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Votre {name}, configuré pour vous.</h2>
            <p className="mt-4 text-white/70">Coloris, sellerie, quantité, livraison : précisez votre besoin, nous revenons vers vous rapidement.</p>
            <a href={telHref(phone)} className="btn-ghost mt-6 text-white"><Phone className="h-4 w-4" aria-hidden /> {phone}</a>
            <p className="mt-6 flex items-center gap-2 text-sm text-white/60"><Wrench className="h-4 w-4 text-brand-300" aria-hidden /> SAV sur site partout en France</p>
          </div>
          <div className="rounded-3xl bg-white p-6 text-ink sm:p-8 lg:col-span-8">
            <InquiryForm type="devis" vehicleRef={name} compact />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x py-20">
          <h2 className="section-title !text-3xl">Dans la même gamme</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r, i) => <VehicleCard key={r.id} vehicle={r} delay={i * 60} />)}
          </div>
          <p className="mt-10 text-center"><Link href="/gammes/golfette-utilitaire" className="font-semibold text-brand-600">Voir tout le catalogue →</Link></p>
        </section>
      )}
    </>
  );
}

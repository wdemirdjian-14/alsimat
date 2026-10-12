import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { vehicleKind } from "@/lib/product";
import { keySpecs, specsOf, type VehicleWithCats } from "@/lib/specs";
import { cn, firstNumber, formatPrice } from "@/lib/utils";
import { CountUp } from "./count-up";

/** Bloc « À la une » de la page d'accueil. */
export function Spotlight({ vehicles }: { vehicles: VehicleWithCats[] }) {
  if (!vehicles.length) return null;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ink to-brand-900 py-20 text-white lg:py-28" aria-labelledby="a-la-une">
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
      <div className="container-x">
        <div data-reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-brand-300">À la une</p>
            <h2 id="a-la-une" className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{vehicles.length > 1 ? "Nos modèles du moment" : "Le modèle du moment"}</h2>
          </div>
        </div>
        <div className="mt-12 space-y-10 lg:space-y-16">
          {vehicles.map((v, idx) => {
            const s = keySpecs(v);
            const benne = firstNumber(Object.entries(specsOf(v)).find(([k]) => /capacit.*benne/i.test(k))?.[1]);
            const stats = [
              s.speedKmh && { n: s.speedKmh, u: "km/h" },
              s.rangeKm && { n: s.rangeKm, u: "km" },
              benne ? { n: benne, u: "kg benne" } : s.seats && { n: s.seats, u: "places" },
            ].filter(Boolean) as { n: number; u: string }[];
            return (
              <article key={v.id} data-reveal className={cn("grid items-center gap-8 overflow-hidden rounded-[2rem] bg-white/[0.04] p-3 ring-1 ring-white/10 lg:grid-cols-2 lg:gap-12", idx % 2 && "lg:[&>*:first-child]:order-2")}>
                <Link href={`/vehicules/${v.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-ink" tabIndex={-1} aria-hidden>
                  {v.video ? (
                    <video src={v.video} poster={v.images[0]} autoPlay muted loop playsInline preload="none" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    v.images[0] && <Image src={v.images[0]} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  )}
                  <span className="absolute top-4 left-4 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold tracking-wide uppercase">Nouveauté</span>
                </Link>
                <div className="p-4 pb-8 lg:p-6">
                  <p className="text-sm font-semibold text-brand-300">{vehicleKind(v)}{s.seats ? ` · ${s.seats} places` : ""}</p>
                  <h3 className="mt-2 text-4xl font-extrabold sm:text-5xl">{v.name.trim()}</h3>
                  {v.tagline && <p className="mt-4 text-lg text-white/75">{v.tagline}</p>}
                  {stats.length > 0 && (
                    <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-white/10 py-6">
                      {stats.map((st) => (
                        <div key={st.u}>
                          <dt className="sr-only">{st.u}</dt>
                          <dd className="font-display text-3xl font-extrabold sm:text-4xl"><CountUp value={st.n} /></dd>
                          <dd className="text-sm text-white/55">{st.u}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="mt-6 text-white/70">{s.price ? "À partir de " : ""}<strong className="font-display text-2xl text-white">{formatPrice(v.price)}</strong></p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/vehicules/${v.slug}`} className="btn-primary">Découvrir le {v.name.trim()} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                    {v.datasheet && <a href={v.datasheet} download className="btn-ghost text-white"><Download className="h-4 w-4" aria-hidden /> Fiche technique</a>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type MomentSlide = {
  slug: string;
  name: string;
  kind: string;
  tagline: string;
  image: string;
  price: string;
  promo: { price: string; label: string } | null;
  stock: string | null;
  roadLegal: boolean;
  specs: { value: string; unit: string }[];
};

const DURATION = 6500;

/** Premier écran : les véhicules du moment « arrivent en roulant », l'un après l'autre. */
export function HeroMoment({ slides, title, highlight, subtitle }: { slides: MomentSlide[]; title: string; highlight: string; subtitle: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(0); // relance l'animation de la barre « route »
  const touch = useRef<number | null>(null);
  const n = slides.length;

  const go = useCallback((d: number) => { setI((x) => (x + d + n) % n); setRun((r) => r + 1); }, [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => go(1), DURATION);
    return () => clearTimeout(t);
  }, [i, paused, n, go, run]);

  if (!n) return null;
  const s = slides[i];

  return (
    <section
      className="hero-moment relative isolate overflow-hidden bg-ink pt-24 pb-8 text-white lg:pt-32 lg:pb-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
      aria-roledescription="carrousel"
      aria-label="Véhicules du moment"
    >
      {/* décor : halos + lignes de vitesse */}
      <div className="pointer-events-none absolute -top-40 right-0 -z-10 h-[40rem] w-[40rem] rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-20 -z-10 h-96 w-96 rounded-full bg-brand-300/10 blur-3xl" aria-hidden />
      <div key={`lines-${i}`} className="speed-lines pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {Array.from({ length: 9 }, (_, k) => <span key={k} style={{ top: `${12 + k * 9}%`, animationDelay: `${(k % 4) * 60}ms`, width: `${20 + (k * 13) % 35}%` }} />)}
      </div>

      <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <h1 className="animate-fade-up text-2xl leading-tight font-extrabold sm:text-3xl xl:text-4xl">
            {title} <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent">{highlight}</span>
          </h1>
          <p className="mt-3 hidden max-w-md animate-fade-up text-sm text-white/65 [animation-delay:100ms] xl:block">{subtitle}</p>

          <div key={`txt-${i}`} className="moment-text mt-6 lg:mt-8">
            <p className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest text-brand-300 uppercase">
              <Zap className="h-4 w-4" aria-hidden /> Véhicule du moment {n > 1 && <span className="text-white/50">{i + 1}/{n}</span>}
            </p>
            <p className="mt-3 font-display text-5xl leading-none font-extrabold sm:text-6xl">{s.name}</p>
            <p className="mt-2 text-lg font-semibold text-brand-200">{s.kind}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.promo && <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-ink uppercase">{s.promo.label}</span>}
              {s.stock && <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold"><span className="h-2 w-2 animate-pulse rounded-full bg-brand-300" />{s.stock}</span>}
              {s.roadLegal && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Homologué route</span>}
            </div>
            {s.tagline && <p className="mt-4 hidden line-clamp-3 max-w-md text-white/80 sm:block">{s.tagline}</p>}
            <p className="mt-5">
              {s.promo ? (
                <>
                  <span className="mr-3 text-lg text-white/50 line-through">{s.price}</span>
                  <strong className="font-display text-3xl text-amber-300">{s.promo.price}</strong>
                </>
              ) : (
                <><span className="text-sm text-white/60">À partir de </span><strong className="font-display text-3xl">{s.price}</strong></>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/vehicules/${s.slug}`} className="btn-primary !px-7 !py-4 text-base">Découvrir <ArrowRight className="h-5 w-5" aria-hidden /></Link>
              <Link href={`/contact?vehicule=${encodeURIComponent(s.name)}`} className="btn-light !px-7 !py-4 text-base">Devis gratuit</Link>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-7">
          <Link href={`/vehicules/${s.slug}`} key={`img-${i}`} className="moment-car group relative block aspect-[4/3] overflow-hidden rounded-[2rem] ring-1 ring-white/10" aria-label={`Voir le ${s.name}`}>
            <Image src={s.image} alt={`${s.name} – ${s.kind}`} fill priority={i === 0} sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-16">
              <dl className="flex gap-6">
                {s.specs.map((sp) => (
                  <div key={sp.unit}><dt className="sr-only">{sp.unit}</dt><dd className="font-display text-2xl font-extrabold sm:text-3xl">{sp.value}<span className="ml-1 text-sm text-brand-300">{sp.unit}</span></dd></div>
                ))}
              </dl>
            </div>
          </Link>
          {/* Préchargement discret des autres véhicules */}
          <div className="hidden" aria-hidden>{slides.map((x, k) => k !== i && <Image key={x.slug} src={x.image} alt="" width={10} height={10} sizes="(min-width: 1024px) 58vw, 100vw" loading="lazy" />)}</div>
        </div>
      </div>

      {n > 1 && (
        <div className="container-x mt-8 flex items-center gap-4">
          <button type="button" onClick={() => go(-1)} aria-label="Véhicule précédent" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 hover:bg-white/10"><ChevronLeft className="h-5 w-5" /></button>
          <div className="road relative h-1.5 flex-1 rounded-full bg-white/10" aria-hidden>
            <div key={`road-${i}-${run}`} className={cn("road-fill h-full rounded-full bg-brand-400", paused && "[animation-play-state:paused]")} style={{ animationDuration: `${DURATION}ms` }} />
          </div>
          <div className="flex gap-2">
            {slides.map((x, k) => (
              <button key={x.slug} type="button" onClick={() => { setI(k); setRun((r) => r + 1); }} aria-label={`Afficher ${x.name}`} aria-current={k === i}
                className={cn("h-2.5 rounded-full transition-all", k === i ? "w-8 bg-brand-300" : "w-2.5 bg-white/30 hover:bg-white/60")} />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Véhicule suivant" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 hover:bg-white/10"><ChevronRight className="h-5 w-5" /></button>
        </div>
      )}
    </section>
  );
}

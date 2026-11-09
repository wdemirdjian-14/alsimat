"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Chapter = {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  links?: { href: string; label: string }[];
  stats?: { value: string; label: string }[];
};

// Formes à 8 sommets : le navigateur peut interpoler de l'une à l'autre (vrai morphing).
const SHAPES = [
  "polygon(0% 0%, 50% 0%, 100% 0%, 100% 50%, 100% 100%, 50% 100%, 0% 100%, 0% 50%)",
  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
  "polygon(12% 0%, 56% 0%, 100% 0%, 94% 50%, 88% 100%, 44% 100%, 0% 100%, 6% 50%)",
  "polygon(50% 0%, 88% 12%, 100% 50%, 88% 88%, 50% 100%, 12% 88%, 0% 50%, 12% 12%)",
];
const HIDDEN = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)";
const BG = ["#0d2420", "#17392f", "#123029", "#0d2420"];

/**
 * Section « figée » : en défilant, l'écran reste en place et se transforme (forme, image, texte,
 * couleur) chapitre après chapitre. Sur mobile, les chapitres s'enchaînent simplement.
 */
export function MorphStory({ chapters }: { chapters: Chapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
        setProgress(p);
        setActive(Math.min(chapters.length - 1, Math.floor(p * chapters.length * 0.999)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [chapters.length]);

  return (
    <>
      {/* Ordinateur : écran figé qui se transforme */}
      <section ref={ref} className="relative hidden lg:block" style={{ height: `${chapters.length * 100}vh` }} aria-label="Découvrir Alsimat">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden text-white transition-colors duration-700" style={{ background: BG[active % BG.length] }}>
          <div className="pointer-events-none absolute inset-0 opacity-40 transition-transform duration-1000" style={{ transform: `translateY(${-progress * 120}px)` }} aria-hidden>
            <div className="absolute top-[10%] left-[5%] h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="absolute right-[8%] bottom-[5%] h-96 w-96 rounded-full bg-brand-300/20 blur-3xl" />
          </div>
          <div className="container-x relative grid grid-cols-12 items-center gap-12">
            <div className="relative col-span-5 min-h-[26rem]">
              {chapters.map((c, k) => (
                <div key={c.title} className={cn("absolute inset-0 flex flex-col justify-center transition-all duration-700", k === active ? "translate-y-0 opacity-100" : k < active ? "-translate-y-12 opacity-0" : "translate-y-12 opacity-0")} aria-hidden={k !== active}>
                  <p className="eyebrow text-brand-300">{String(k + 1).padStart(2, "0")} · {c.eyebrow}</p>
                  <h2 className="mt-4 text-4xl leading-tight font-extrabold xl:text-5xl">{c.title}</h2>
                  <p className="mt-5 text-lg text-white/75">{c.text}</p>
                  {c.stats && (
                    <dl className="mt-8 grid grid-cols-3 gap-4">
                      {c.stats.map((s) => <div key={s.label}><dd className="font-display text-3xl font-extrabold text-brand-300">{s.value}</dd><dt className="text-xs text-white/60">{s.label}</dt></div>)}
                    </dl>
                  )}
                  {c.links && (
                    <ul className="mt-8 flex flex-wrap gap-2">
                      {c.links.map((l) => (
                        <li key={l.href}><Link href={l.href} tabIndex={k === active ? 0 : -1} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-brand-500">{l.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="relative col-span-7 aspect-[4/3]">
              {chapters.map((c, k) => (
                <div key={c.image + k} className="absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(0.7,0,0.3,1)]"
                  style={{ clipPath: k === active ? SHAPES[k % SHAPES.length] : HIDDEN, transform: k === active ? `scale(1) rotate(0deg)` : `scale(1.15) rotate(${k < active ? -6 : 6}deg)` }}>
                  <Image src={c.image} alt="" fill sizes="58vw" loading="eager" className="object-cover" style={{ transform: `scale(${1.05 + progress * 0.1})` }} />
                </div>
              ))}
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-2 font-display text-sm font-bold text-ink shadow-xl">
                {chapters[active].eyebrow}
              </span>
            </div>
          </div>
          <ol className="absolute top-1/2 right-6 flex -translate-y-1/2 flex-col gap-3" aria-hidden>
            {chapters.map((c, k) => <li key={c.title} className={cn("h-10 w-1.5 rounded-full transition-all duration-500", k === active ? "bg-brand-300" : "bg-white/20")} />)}
          </ol>
          <div className="absolute bottom-0 left-0 h-1 bg-brand-400" style={{ width: `${progress * 100}%` }} aria-hidden />
        </div>
      </section>

      {/* Mobile / tablette : défilement classique */}
      <section className="bg-ink py-16 text-white lg:hidden">
        <div className="container-x space-y-16">
          {chapters.map((c, k) => (
            <article key={c.title} data-reveal>
              <div className="relative aspect-[4/3] overflow-hidden" style={{ clipPath: SHAPES[k % SHAPES.length] }}>
                <Image src={c.image} alt="" fill sizes="100vw" className="object-cover" />
              </div>
              <p className="eyebrow mt-6 text-brand-300">{String(k + 1).padStart(2, "0")} · {c.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-extrabold">{c.title}</h2>
              <p className="mt-3 text-white/75">{c.text}</p>
              {c.stats && <dl className="mt-6 grid grid-cols-3 gap-3">{c.stats.map((s) => <div key={s.label}><dd className="font-display text-2xl font-extrabold text-brand-300">{s.value}</dd><dt className="text-xs text-white/60">{s.label}</dt></div>)}</dl>}
              {c.links && <ul className="mt-6 flex flex-wrap gap-2">{c.links.map((l) => <li key={l.href}><Link href={l.href} className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">{l.label}</Link></li>)}</ul>}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

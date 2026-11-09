"use client";

import { useEffect, useState } from "react";

type Summary = { models: number; inStock: number; promos: number };

/**
 * Écran d'arrivée : une batterie se charge en annonçant les offres et le stock, puis « explose »
 * pour révéler le site (déjà rendu dessous : aucun impact SEO).
 * Une fois par session, 1,8 s, cliquable pour passer, désactivé pour les robots et « mouvement réduit ».
 */
export function IntroLoader({ summary }: { summary: Summary }) {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<"charge" | "boom" | "done">("charge");

  const lines = [
    "Connexion au parc Alsimat…",
    "Vérification des stocks…",
    summary.promos || summary.inStock
      ? [summary.promos && `${summary.promos} offre${summary.promos > 1 ? "s" : ""} du moment`, summary.inStock && `${summary.inStock} véhicule${summary.inStock > 1 ? "s" : ""} disponible${summary.inStock > 1 ? "s" : ""}`].filter(Boolean).join(" · ")
      : `${summary.models} modèles électriques prêts à rouler`,
  ];

  useEffect(() => {
    if (document.documentElement.dataset.intro === "off") {
      setPhase("done");
      return;
    }
    try { sessionStorage.setItem("alsimat-intro", "1"); } catch {}
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(100, ((t - start) / 1300) * 100);
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else setPhase("boom");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase === "boom") {
      const t = setTimeout(() => setPhase("done"), 650);
      return () => clearTimeout(t);
    }
    if (phase === "done") document.documentElement.style.overflow = "";
  }, [phase]);

  if (phase === "done") return null;
  const line = lines[Math.min(lines.length - 1, Math.floor(pct / 34))];

  return (
    <div
      className="intro fixed inset-0 z-[100] grid place-items-center bg-ink text-white"
      data-phase={phase}
      onClick={() => setPhase("boom")}
      role="status"
      aria-label="Chargement des offres du moment"
    >
      <div className="intro-core flex flex-col items-center">
        <div className="intro-battery relative">
          <svg viewBox="0 0 220 110" className="w-56 sm:w-72" aria-hidden>
            <rect x="4" y="4" width="196" height="102" rx="18" fill="none" stroke="currentColor" strokeWidth="6" opacity=".9" />
            <rect x="202" y="36" width="14" height="38" rx="5" fill="currentColor" opacity=".9" />
            <defs>
              <linearGradient id="charge" x1="0" x2="1"><stop offset="0" stopColor="#46a584" /><stop offset="1" stopColor="#aee4c7" /></linearGradient>
            </defs>
            <rect x="14" y="14" height="82" rx="10" fill="url(#charge)" width={(176 * pct) / 100} />
            <path d="M112 22 L84 60 H104 L96 90 L128 50 H108 Z" fill="#0d2420" opacity={pct > 45 ? 0.85 : 0.35} />
          </svg>
          {phase === "boom" && (
            <div className="intro-particles" aria-hidden>
              {Array.from({ length: 22 }, (_, i) => {
                const a = (i / 22) * Math.PI * 2;
                const d = 160 + (i % 5) * 60;
                return <span key={i} style={{ "--dx": `${Math.cos(a) * d}px`, "--dy": `${Math.sin(a) * d}px`, "--r": `${i * 47}deg` } as React.CSSProperties} />;
              })}
            </div>
          )}
        </div>
        <p className="mt-6 font-display text-5xl font-extrabold tabular-nums">{Math.round(pct)}<span className="text-brand-300">%</span></p>
        <p className="mt-3 h-6 text-center text-sm text-white/75 sm:text-base" aria-live="polite">{line}</p>
      </div>
      <button type="button" className="absolute right-5 bottom-5 rounded-full px-4 py-2 text-xs font-semibold text-white/60 hover:text-white" onClick={() => setPhase("boom")}>
        Passer →
      </button>
    </div>
  );
}

/** Script exécuté avant l'affichage : masque l'intro si déjà vue, robot ou mouvement réduit. */
export const introGateScript = `try{var u=navigator.userAgent;if(sessionStorage.getItem("alsimat-intro")||/bot|crawl|spider|lighthouse|pagespeed|headless|preview/i.test(u)||navigator.webdriver||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="off"}catch(e){}`;

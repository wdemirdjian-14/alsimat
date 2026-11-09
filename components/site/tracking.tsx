"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { captureSource, track } from "@/lib/track";

export type TrackingConfig = { gtm?: string; ga4?: string; ads?: string; adsLead?: string; metaPixel?: string };

const KEY = "alsimat-consent";
type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: unknown; __adsLead?: string; __gtm?: boolean };

function load(cfg: TrackingConfig) {
  const w = window as W;
  if (cfg.gtm && !w.__gtm) {
    w.__gtm = true;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${cfg.gtm}`;
    document.head.appendChild(s);
  }
  if ((cfg.ga4 || cfg.ads) && !w.gtag) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${cfg.ga4 || cfg.ads}`;
    document.head.appendChild(s);
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () { (w.dataLayer as unknown[]).push(arguments); };
    w.gtag("js", new Date());
    if (cfg.ga4) w.gtag("config", cfg.ga4);
    if (cfg.ads) w.gtag("config", cfg.ads);
    if (cfg.ads && cfg.adsLead) w.__adsLead = `${cfg.ads}/${cfg.adsLead}`;
  }
  if (cfg.metaPixel && !w.fbq) {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any) { if (f.fbq) return; const n: any = (f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }); if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; const t = b.createElement(e); t.async = !0; t.src = v; const s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    (window as any).fbq("init", cfg.metaPixel);
    (window as any).fbq("track", "PageView");
    /* eslint-enable */
  }
}

/**
 * Mesure d'audience et publicité (Google Analytics 4, Google Ads, Meta) chargées UNIQUEMENT après
 * accord du visiteur (exigence CNIL). Sans identifiant configuré : aucun bandeau, aucun cookie.
 */
export function Tracking({ config }: { config: TrackingConfig }) {
  const enabled = !!(config.gtm || config.ga4 || config.ads || config.metaPixel);
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    captureSource();
    if (!enabled) return;
    let choice: string | null = null;
    try { choice = localStorage.getItem(KEY); } catch {}
    if (choice === "granted") load(config);
    else if (!choice) setAsk(true);
    const reopen = () => setAsk(true);
    window.addEventListener("alsimat:cookies", reopen);
    return () => window.removeEventListener("alsimat:cookies", reopen);
  }, [enabled, config]);

  // Clics à mesurer partout : appels et fiches techniques.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("tel:")) track("call", { page: location.pathname });
      else if (href.endsWith(".pdf")) track("datasheet", { file: href });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!ask) return null;
  const decide = (v: "granted" | "denied") => {
    try { localStorage.setItem(KEY, v); } catch {}
    setAsk(false);
    if (v === "granted") load(config);
  };
  return (
    <div role="dialog" aria-label="Cookies" className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl rounded-3xl bg-white p-5 text-sm text-ink shadow-2xl ring-1 ring-ink/10 lg:bottom-6 lg:left-6 lg:mx-0">
      <p className="font-bold">On vous propose des offres qui vous ressemblent 🍪</p>
      <p className="mt-1 text-ink-soft">
        Avec votre accord, nous mesurons la fréquentation et l'efficacité de nos publicités (Google, Meta). Rien n'est déposé si vous refusez.{" "}
        <Link href="/confidentialite" className="underline">En savoir plus</Link>
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => decide("denied")} className="btn-ghost flex-1 !py-2.5 text-ink">Refuser</button>
        <button type="button" onClick={() => decide("granted")} className="btn-primary flex-1 !py-2.5">Accepter</button>
      </div>
    </div>
  );
}

export function CookieSettingsLink() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event("alsimat:cookies"))} className="hover:text-white">Cookies</button>;
}

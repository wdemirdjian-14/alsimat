"use client";

/** Envoi d'événements aux outils de mesure chargés (uniquement après consentement). */
type W = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; __adsLead?: string; __gtm?: boolean; dataLayer?: unknown[] };

export function track(event: "lead" | "call" | "datasheet" | "walau_open" | "walau_message", params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as W;
  const ga: Record<string, string> = { lead: "generate_lead", call: "click_to_call", datasheet: "file_download", walau_open: "walau_open", walau_message: "generate_lead" };
  // Google Tag Manager : événement personnalisé (déclencheur « Événement personnalisé » dans GTM).
  if (w.__gtm) w.dataLayer?.push({ event: ga[event], ...params });
  w.gtag?.("event", ga[event], params);
  if ((event === "lead" || event === "walau_message") && w.__adsLead) w.gtag?.("event", "conversion", { send_to: w.__adsLead });
  if (event === "lead" || event === "walau_message") w.fbq?.("track", "Lead", params);
  if (event === "call") w.fbq?.("track", "Contact");
}

/** Provenance du visiteur (1er contact, conservée 30 jours) : campagne, réseau social, moteur… */
const KEY = "alsimat-source";
export function captureSource() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw && Date.now() - JSON.parse(raw).t < 30 * 86400_000) return;
    const q = new URLSearchParams(location.search);
    let src = "";
    if (q.get("gclid") || q.get("gbraid") || q.get("wbraid")) src = "Google Ads";
    else if (q.get("fbclid")) src = "Facebook / Instagram";
    if (q.get("utm_source")) src = [q.get("utm_source"), q.get("utm_medium"), q.get("utm_campaign")].filter(Boolean).join(" / ") + (src ? ` (${src})` : "");
    if (!src && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && host !== location.hostname.replace(/^www\./, "")) src = /google|bing|qwant|duckduckgo|ecosia|yahoo/.test(host) ? `Recherche naturelle (${host})` : `Lien depuis ${host}`;
    }
    localStorage.setItem(KEY, JSON.stringify({ s: src || "Accès direct", t: Date.now(), p: location.pathname }));
  } catch {}
}
export function getSource() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v ? `${v.s} — arrivée sur ${v.p}` : "";
  } catch {
    return "";
  }
}

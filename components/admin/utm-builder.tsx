"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { slugify } from "@/lib/utils";

const PRESETS = [
  { label: "Facebook / Instagram (pub)", source: "facebook", medium: "paid" },
  { label: "Google Ads (manuel)", source: "google", medium: "cpc" },
  { label: "LinkedIn", source: "linkedin", medium: "social" },
  { label: "E-mail / newsletter", source: "newsletter", medium: "email" },
  { label: "QR code (flyer, salon)", source: "salon", medium: "qr" },
  { label: "Partenaire", source: "partenaire", medium: "referral" },
];

export function UtmBuilder({ base, pages }: { base: string; pages: { url: string; label: string }[] }) {
  const [page, setPage] = useState(pages[0]?.url ?? "/");
  const [source, setSource] = useState("facebook");
  const [medium, setMedium] = useState("paid");
  const [campaign, setCampaign] = useState("");
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => {
    const u = new URL(page, base);
    if (source) u.searchParams.set("utm_source", slugify(source));
    if (medium) u.searchParams.set("utm_medium", slugify(medium));
    if (campaign) u.searchParams.set("utm_campaign", slugify(campaign));
    return u.toString();
  }, [base, page, source, medium, campaign]);
  return (
    <div className="space-y-3">
      <label className="block"><span className="label">Page d'arrivée</span>
        <select value={page} onChange={(e) => setPage(e.target.value)} className="field">{pages.map((p) => <option key={p.url} value={p.url}>{p.label}</option>)}</select>
      </label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => { setSource(p.source); setMedium(p.medium); }}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${source === p.source && medium === p.medium ? "bg-ink text-white" : "bg-sand"}`}>{p.label}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label><span className="label">Source</span><input value={source} onChange={(e) => setSource(e.target.value)} className="field" /></label>
        <label><span className="label">Support</span><input value={medium} onChange={(e) => setMedium(e.target.value)} className="field" /></label>
        <label><span className="label">Campagne</span><input value={campaign} onChange={(e) => setCampaign(e.target.value)} className="field" placeholder="promo-automne" /></label>
      </div>
      <div className="flex gap-2">
        <input readOnly value={url} className="field font-mono text-xs" onFocus={(e) => e.target.select()} />
        <button type="button" onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn-dark !px-4 !py-2.5">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-ink/55">Chaque demande arrivée par ce lien affichera sa provenance dans le CRM. Inutile pour Google Ads (suivi automatique).</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, MessageCircle, Phone, Send, Tag, X } from "lucide-react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { getSource, track } from "@/lib/track";
import { cn } from "@/lib/utils";

const IDLE_MS = 30_000;

/** La petite voiture Walau : assistant de contact, toujours accessible en bas à droite. */
function Car({ honk }: { honk: boolean }) {
  return (
    <svg viewBox="0 0 120 70" className={cn("walau-car h-12 w-20", honk && "walau-honk")} aria-hidden>
      <path d="M14 46 Q14 30 30 28 L44 14 Q48 10 56 10 H82 Q90 10 94 18 L100 28 Q112 30 112 44 V48 Q112 52 108 52 H18 Q14 52 14 48 Z" fill="#46a584" />
      <path d="M48 16 H80 Q86 16 88 22 L92 28 H40 Z" fill="#d5f2e1" />
      <rect x="62" y="16" width="3" height="12" fill="#46a584" />
      <circle cx="104" cy="38" r="3.5" fill="#fff6c2" />
      <path d="M58 34 L52 44 H58 L55 51 L64 40 H58 L61 34 Z" fill="#0d2420" opacity=".55" />
      <g className="walau-wheel" style={{ transformOrigin: "34px 52px" }}><circle cx="34" cy="52" r="10" fill="#0d2420" /><circle cx="34" cy="52" r="4" fill="#aee4c7" /><rect x="33" y="43" width="2" height="18" fill="#3f5550" /></g>
      <g className="walau-wheel" style={{ transformOrigin: "92px 52px" }}><circle cx="92" cy="52" r="10" fill="#0d2420" /><circle cx="92" cy="52" r="4" fill="#aee4c7" /><rect x="91" y="43" width="2" height="18" fill="#3f5550" /></g>
    </svg>
  );
}

export function Walau({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "form">("menu");
  const [nudge, setNudge] = useState(false);
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, null);
  const [startedAt, setStartedAt] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 30 s sans activité : Walau propose son aide (une seule fois par visite).
  useEffect(() => {
    let done = false;
    try { done = !!sessionStorage.getItem("walau-nudge"); } catch {}
    if (done) return;
    const arm = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try { sessionStorage.setItem("walau-nudge", "1"); } catch {}
        setNudge(true);
        if (window.matchMedia("(min-width: 1024px)").matches) setOpen(true);
        cleanup();
      }, IDLE_MS);
    };
    const evs = ["mousemove", "scroll", "keydown", "touchstart", "click"] as const;
    const cleanup = () => { evs.forEach((e) => window.removeEventListener(e, arm)); if (timer.current) clearTimeout(timer.current); };
    evs.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();
    return cleanup;
  }, []);

  useEffect(() => { if (open) { track("walau_open"); setStartedAt(Date.now()); } }, [open]);
  useEffect(() => { if (state?.ok) track("walau_message", { form: "walau" }); }, [state]);

  const err = (n: string) => state?.errors?.[n];

  return (
    <div className="fixed right-3 bottom-20 z-40 flex flex-col items-end lg:right-6 lg:bottom-6">
      {open && (
        <div role="dialog" aria-label="Walau, assistant Alsimat" className="walau-panel mb-3 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl bg-white text-ink shadow-2xl shadow-ink/25 ring-1 ring-ink/5">
          <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
            <div>
              <p className="font-display text-lg font-extrabold">Walau</p>
              <p className="flex items-center gap-1.5 text-xs text-white/60"><span className="h-2 w-2 rounded-full bg-brand-300" /> Assistant Alsimat · réponse rapide</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-5">
            {state?.ok ? (
              <div className="py-6 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-brand-500" /><p className="mt-3 font-semibold">{state.message}</p></div>
            ) : view === "menu" ? (
              <>
                <p className="rounded-2xl rounded-tl-sm bg-sand px-4 py-3 text-sm">
                  {nudge ? "Est-ce que je peux vous aider ? 🙂" : "Bonjour 👋 Je suis Walau."} Une question sur un véhicule, un devis, le SAV ? Je transmets tout de suite à l'équipe.
                </p>
                <div className="mt-4 grid gap-2">
                  <button type="button" onClick={() => setView("form")} className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 text-left text-sm font-semibold hover:border-brand-500 hover:bg-brand-50"><MessageCircle className="h-5 w-5 text-brand-500" /> Envoyer un message</button>
                  <Link href="/contact" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 text-sm font-semibold hover:border-brand-500 hover:bg-brand-50"><FileText className="h-5 w-5 text-brand-500" /> Demander un devis gratuit</Link>
                  <a href={phoneHref} onClick={() => track("call", { from: "walau" })} className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 text-sm font-semibold hover:border-brand-500 hover:bg-brand-50"><Phone className="h-5 w-5 text-brand-500" /> Appeler le {phone}</a>
                  <Link href="/#moment" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 text-sm font-semibold hover:border-brand-500 hover:bg-brand-50"><Tag className="h-5 w-5 text-brand-500" /> Voir les véhicules du moment</Link>
                </div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="grid gap-3" noValidate>
                <input type="hidden" name="type" value="contact" />
                <input type="hidden" name="subject" value="Message via Walau" />
                <input type="hidden" name="startedAt" value={startedAt} />
                <input type="hidden" name="source" value={typeof window !== "undefined" ? getSource() : ""} />
                <div className="hidden" aria-hidden><input name="website" tabIndex={-1} autoComplete="off" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <input name="firstName" placeholder="Prénom *" autoComplete="given-name" className={cn("field !py-2.5", err("firstName") && "border-red-400")} />
                  <input name="lastName" placeholder="Nom *" autoComplete="family-name" className={cn("field !py-2.5", err("lastName") && "border-red-400")} />
                </div>
                <input name="email" type="email" placeholder="E-mail *" autoComplete="email" className={cn("field !py-2.5", err("email") && "border-red-400")} />
                <input name="phone" type="tel" placeholder="Téléphone (pour être rappelé)" autoComplete="tel" className="field !py-2.5" />
                <textarea name="message" rows={3} placeholder="Votre message *" className={cn("field !py-2.5", err("message") && "border-red-400")} />
                <label className="flex items-start gap-2 text-[11px] text-ink-soft">
                  <input type="checkbox" name="consent" className="mt-0.5 accent-brand-500" /> J'accepte qu'Alsimat utilise ces informations pour me répondre (<Link href="/confidentialite" className="underline">confidentialité</Link>).
                </label>
                {state && !state.ok && <p className="text-xs text-red-600">{state.message}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setView("menu")} className="btn-ghost !px-4 !py-2.5 text-ink">Retour</button>
                  <button type="submit" disabled={pending} className="btn-primary flex-1 !py-2.5">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {nudge && !open && (
        <button type="button" onClick={() => setOpen(true)} className="walau-bubble mb-2 rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-xl ring-1 ring-ink/5">
          Est-ce que je peux vous aider ?
        </button>
      )}
      <button type="button" onClick={() => { setOpen((o) => !o); setNudge(false); }} aria-label={open ? "Fermer Walau" : "Ouvrir Walau, l'assistant Alsimat"} aria-expanded={open}
        className="group relative rounded-full bg-white/95 px-2 pt-2 pb-1 shadow-xl ring-1 ring-ink/5 transition hover:-translate-y-1">
        <Car honk={nudge && !open} />
        <span className="absolute -top-1 left-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white shadow">Walau</span>
      </button>
    </div>
  );
}

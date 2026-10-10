"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Paperclip, Send } from "lucide-react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { cn } from "@/lib/utils";

type Props = {
  type: "devis" | "contact" | "sav";
  vehicleRef?: string;
  vehicleOptions?: string[];
  compact?: boolean;
  submitLabel?: string;
};

export function InquiryForm({ type, vehicleRef, vehicleOptions, compact, submitLabel }: Props) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, null);
  const [kind, setKind] = useState(type);
  const [startedAt, setStartedAt] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => setStartedAt(Date.now()), []);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  if (state?.ok)
    return (
      <div role="status" className="flex flex-col items-center rounded-3xl bg-brand-50 p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-brand-500" aria-hidden />
        <p className="mt-4 text-xl font-bold text-ink">{state.message}</p>
        <p className="mt-2 text-sm text-ink-soft">Une confirmation vous a été envoyée par e-mail.</p>
      </div>
    );

  const err = (name: string) => state?.errors?.[name];
  const field = (name: string) => cn("field", err(name) && "border-red-400 focus:border-red-500 focus:ring-red-500/15");
  const Err = ({ name }: { name: string }) => (err(name) ? <p className="mt-1 text-xs text-red-600">{err(name)}</p> : null);

  return (
    <form ref={ref} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="grid gap-4" noValidate>
      <input type="hidden" name="type" value={kind} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="hidden" aria-hidden>
        <label>Site web <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {type === "contact" && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-sand p-1" role="radiogroup" aria-label="Type de demande">
          {(["devis", "contact"] as const).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
              className={cn("rounded-xl px-4 py-2.5 text-sm font-semibold transition", kind === k ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink")}>
              {k === "devis" ? "Demande de devis" : "Question / information"}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${type}-firstName`}>Prénom *</label>
          <input id={`${type}-firstName`} name="firstName" autoComplete="given-name" required className={field("firstName")} />
          <Err name="firstName" />
        </div>
        <div>
          <label className="label" htmlFor={`${type}-lastName`}>Nom *</label>
          <input id={`${type}-lastName`} name="lastName" autoComplete="family-name" required className={field("lastName")} />
          <Err name="lastName" />
        </div>
        <div>
          <label className="label" htmlFor={`${type}-email`}>E-mail *</label>
          <input id={`${type}-email`} name="email" type="email" autoComplete="email" required className={field("email")} />
          <Err name="email" />
        </div>
        <div>
          <label className="label" htmlFor={`${type}-phone`}>Téléphone{kind === "sav" ? " *" : ""}</label>
          <input id={`${type}-phone`} name="phone" type="tel" autoComplete="tel" className={field("phone")} />
          <Err name="phone" />
        </div>
        {!compact && (
          <>
            <div>
              <label className="label" htmlFor={`${type}-company`}>Société / établissement</label>
              <input id={`${type}-company`} name="company" autoComplete="organization" className="field" />
            </div>
            <div>
              <label className="label" htmlFor={`${type}-postalCode`}>Code postal</label>
              <input id={`${type}-postalCode`} name="postalCode" autoComplete="postal-code" inputMode="numeric" className="field" />
            </div>
          </>
        )}
      </div>

      {kind === "sav" && (
        <div>
          <label className="label" htmlFor="sav-serial">Numéro de série du véhicule *</label>
          <input id="sav-serial" name="serialNumber" required className={field("serialNumber")} placeholder="Indiqué sur la plaque constructeur" />
          <Err name="serialNumber" />
        </div>
      )}

      {kind === "devis" && (vehicleRef ? (
        <input type="hidden" name="vehicleRef" value={vehicleRef} />
      ) : vehicleOptions?.length ? (
        <div>
          <label className="label" htmlFor="devis-vehicle">Modèle qui vous intéresse</label>
          <select id="devis-vehicle" name="vehicleRef" className="field" defaultValue="">
            <option value="">Je ne sais pas encore / plusieurs modèles</option>
            {vehicleOptions.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      ) : null)}

      {kind === "contact" && (
        <div>
          <label className="label" htmlFor="contact-subject">Objet</label>
          <input id="contact-subject" name="subject" className="field" />
        </div>
      )}

      <div>
        <label className="label" htmlFor={`${type}-message`}>
          {kind === "sav" ? "Description du problème *" : kind === "devis" ? "Votre projet (usage, quantité, options…)" : "Message *"}
        </label>
        <textarea id={`${type}-message`} name="message" rows={compact ? 3 : 5} className={field("message")} />
        <Err name="message" />
      </div>

      {kind === "sav" && (
        <div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink/20 px-4 py-4 text-sm text-ink-soft transition hover:border-brand-500 hover:bg-brand-50/50">
            <Paperclip className="h-5 w-5 text-brand-500" aria-hidden />
            <span>{fileNames.length ? fileNames.join(", ") : "Ajouter des photos ou vidéos (6 fichiers, 15 Mo max chacun)"}</span>
            <input type="file" name="files" multiple accept="image/*,video/mp4,video/quicktime,application/pdf" className="sr-only"
              onChange={(e) => setFileNames([...(e.target.files ?? [])].map((f) => f.name))} />
          </label>
          <Err name="files" />
        </div>
      )}

      <label className="flex items-start gap-3 text-xs leading-relaxed text-ink-soft">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500" />
        <span>
          J'accepte qu'Alsimat utilise ces informations pour répondre à ma demande. Voir notre{" "}
          <Link href="/confidentialite" className="underline hover:text-brand-600">politique de confidentialité</Link>.
        </span>
      </label>
      <Err name="consent" />

      {state && !state.ok && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full !py-4 text-base sm:w-auto sm:justify-self-start">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Send className="h-5 w-5" aria-hidden />}
        {submitLabel ?? (kind === "sav" ? "Envoyer ma demande SAV" : kind === "devis" ? "Recevoir mon devis gratuit" : "Envoyer le message")}
      </button>
    </form>
  );
}

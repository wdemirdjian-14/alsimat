"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { Loader2, Upload } from "lucide-react";
import { importContacts, type ImportReport } from "@/app/admin/actions/crm";
import { CONSENTS, SEGMENTS } from "@/lib/crm";

export function ImportForm({ lists }: { lists: { id: string; name: string }[] }) {
  const [r, run, pending] = useActionState<ImportReport, FormData>(importContacts, null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => run(fd)); }} className="space-y-4">
      <label className="block"><span className="label">Fichier Excel ou CSV *</span><input type="file" name="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required className="field" /></label>
      <fieldset className="rounded-2xl border border-ink/10 p-4">
        <legend className="px-1 text-sm font-semibold">Ajouter les contacts à une liste de diffusion</legend>
        <input name="newList" className="field" placeholder="Nouvelle liste, ex. « Campings Bretagne 2026 »" />
        {lists.length > 0 && <div className="mt-3 grid gap-1 sm:grid-cols-2">{lists.map((l) => <label key={l.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="listIds" value={l.id} className="accent-brand-500" /> {l.name}</label>)}</div>}
        <p className="mt-2 text-xs text-ink/50">Une colonne « Liste » dans le fichier classe aussi chaque ligne automatiquement.</p>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">Étiquettes à ajouter</span><input name="tags" className="field" placeholder="campings-loire, salon-2026" /></label>
        <label className="block"><span className="label">Provenance</span><input name="source" className="field" placeholder="Fichier CCI, salon…" /></label>
        <label className="block"><span className="label">Segment</span><select name="segment" className="field">{SEGMENTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></label>
        <label className="block"><span className="label">Base légale</span><select name="consent" className="field">{CONSENTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></label>
      </div>
      <label className="block"><span className="label">Origine des données (preuve RGPD)</span><input name="originNote" className="field" placeholder="Ex. annuaire des campings 2026 acheté chez …" /></label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="overwrite" className="mt-1 accent-brand-500" /> Mettre à jour les informations des contacts déjà présents</label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="certify" required className="mt-1 accent-brand-500" /> Je certifie que ces données ont été obtenues légalement et qu'il s'agit de professionnels (ou de personnes ayant donné leur accord).</label>
      {r && (
        <div className={r.ok ? "rounded-xl bg-brand-50 p-4 text-sm text-brand-800" : "rounded-xl bg-red-50 p-4 text-sm text-red-700"}>
          <p className="font-semibold">{r.message}</p>
          {r.ok && <p className="mt-1">{r.created} créé(s) · {r.updated} mis à jour · {r.skipped} ignoré(s){r.lists?.length ? ` · listes : ${r.lists.join(", ")}` : ""}</p>}
          {!!r.invalid?.length && <p className="mt-1 text-xs">Adresses invalides : {r.invalid.join(", ")}</p>}
          {r.ok && <Link href="/admin/contacts" className="mt-2 inline-block font-semibold underline">Voir les contacts</Link>}
        </div>
      )}
      <button disabled={pending} className="btn-primary">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Importer</button>
    </form>
  );
}

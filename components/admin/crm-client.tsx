"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { setStatus } from "@/app/admin/actions/crm";
import { STATUSES } from "@/lib/crm";

export function SelectAll() {
  return (
    <input type="checkbox" aria-label="Tout sélectionner" className="h-4 w-4 accent-brand-500"
      onChange={(e) => document.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((c) => (c.checked = e.target.checked))} />
  );
}

export function StatusSelect({ id, value }: { id: string; value: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select defaultValue={value} disabled={pending} aria-label="Statut"
      onChange={(e) => { const v = e.target.value; start(async () => { await setStatus(id, v); router.refresh(); }); }}
      className="w-full rounded-lg border border-ink/10 bg-white px-2 py-1 text-xs">
      {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
    </select>
  );
}

export function EmailComposer({ action, disabled }: { action: (prev: string | null, fd: FormData) => Promise<string | null>; disabled?: string }) {
  const [msg, run, pending] = useActionState(action, null);
  if (disabled) return <p className="text-sm text-ink/55">{disabled}</p>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => run(fd)); }} className="space-y-3">
      <input name="subject" placeholder="Objet" className="field" required />
      <textarea name="body" rows={6} className="field" placeholder={"Bonjour {{prenom}},\n\n…"} required />
      <p className="text-xs text-ink/50">Champs : {"{{prenom}} {{nom}} {{societe}} {{ville}}"} · **gras** · [lien](https://…)</p>
      {msg && <p className={msg === "ok" ? "text-sm text-brand-700" : "text-sm text-red-600"}>{msg === "ok" ? "E-mail envoyé et ajouté à l'historique." : msg}</p>}
      <button disabled={pending} className="btn-primary !py-2.5">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer</button>
    </form>
  );
}

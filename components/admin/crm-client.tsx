"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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

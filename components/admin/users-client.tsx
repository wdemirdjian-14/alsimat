"use client";

import { startTransition, useActionState, useState, useTransition } from "react";
import { Loader2, Send, UserPlus } from "lucide-react";
import { inviteAdmin, resendAccess } from "@/app/admin/actions/users";

export function InviteForm() {
  const [msg, run, pending] = useActionState(inviteAdmin, null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const fd = new FormData(f); startTransition(() => run(fd)); }} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="label">E-mail *</span><input name="email" type="email" required className="field" placeholder="prenom.nom@alsimat.com" /></label>
        <label className="block"><span className="label">Nom</span><input name="name" className="field" placeholder="Prénom Nom" /></label>
      </div>
      {msg && <p className={msg.startsWith("ok:") ? "text-sm text-brand-700" : "text-sm text-red-600"}>{msg.replace(/^ok:/, "")}</p>}
      <button disabled={pending} className="btn-primary !py-2.5">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Créer et envoyer l'invitation</button>
    </form>
  );
}

export function ResendButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" disabled={pending} onClick={() => start(async () => { const r = await resendAccess(id); setMsg(r === "ok" ? "Lien envoyé ✔" : r); })}
        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} {label}
      </button>
      {msg && <span className="text-xs text-ink/60">{msg}</span>}
    </span>
  );
}

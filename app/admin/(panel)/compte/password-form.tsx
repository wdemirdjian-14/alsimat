"use client";

import { startTransition, useActionState } from "react";
import { changePassword } from "../../actions/auth";

export function PasswordForm() {
  const [msg, action, pending] = useActionState(changePassword, null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form); startTransition(() => action(fd)); }} className="space-y-4">
      <label className="block"><span className="label">Mot de passe actuel</span><input name="current" type="password" autoComplete="current-password" required className="field" /></label>
      <label className="block"><span className="label">Nouveau mot de passe (12 caractères min.)</span><input name="next" type="password" autoComplete="new-password" minLength={12} required className="field" /></label>
      <label className="block"><span className="label">Confirmation</span><input name="confirm" type="password" autoComplete="new-password" required className="field" /></label>
      {msg && <p role="status" className={msg === "ok" ? "text-sm text-brand-700" : "text-sm text-red-600"}>{msg === "ok" ? "Mot de passe modifié." : msg}</p>}
      <button disabled={pending} className="btn-primary !py-2.5">Modifier</button>
    </form>
  );
}

"use client";

import { startTransition, useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login } from "../actions/auth";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="mt-6 space-y-4">
      <label className="block"><span className="label">E-mail</span><input name="email" type="email" autoComplete="username" required className="field" /></label>
      <label className="block"><span className="label">Mot de passe</span><input name="password" type="password" autoComplete="current-password" required className="field" /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Se connecter</button>
    </form>
  );
}

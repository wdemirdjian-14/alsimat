"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { Loader2 } from "lucide-react";
import { activateAccount, requestReset } from "@/app/admin/actions/users";

export function ActivationForm({ token, email, askName }: { token: string; email: string; askName: boolean }) {
  const [error, run, pending] = useActionState(activateAccount.bind(null, token), null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => run(fd)); }} className="mt-6 space-y-4">
      <input type="email" name="username" value={email} autoComplete="username" readOnly className="field bg-sand" />
      {askName && <label className="block"><span className="label">Votre nom</span><input name="name" autoComplete="name" className="field" /></label>}
      <label className="block"><span className="label">Mot de passe (12 caractères min.)</span><input name="password" type="password" autoComplete="new-password" minLength={12} required className="field" /></label>
      <label className="block"><span className="label">Confirmation</span><input name="confirm" type="password" autoComplete="new-password" minLength={12} required className="field" /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer et me connecter</button>
    </form>
  );
}

export function ResetRequestForm() {
  const [msg, run, pending] = useActionState(requestReset, null);
  if (msg === "ok") return <p className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">Si un compte existe pour cette adresse, un e-mail avec un lien vient d'être envoyé (pensez aux indésirables). <Link href="/admin/login" className="font-semibold underline">Retour</Link></p>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => run(fd)); }} className="mt-6 space-y-4">
      <label className="block"><span className="label">E-mail</span><input name="email" type="email" autoComplete="username" required className="field" /></label>
      {msg && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{msg}</p>}
      <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Recevoir un lien</button>
    </form>
  );
}

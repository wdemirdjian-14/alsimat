"use client";

import { startTransition, useActionState } from "react";
import { Loader2, Send } from "lucide-react";

export function TestSend({ action }: { action: (prev: string | null, fd: FormData) => Promise<string | null> }) {
  const [msg, run, pending] = useActionState(action, null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => run(fd)); }} className="flex flex-wrap gap-2">
      <input name="testEmail" type="email" placeholder="Votre e-mail (sinon celui du compte)" className="field flex-1 !py-2.5" />
      <button disabled={pending} className="btn-dark !py-2.5">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Tester</button>
      {msg && <p className={msg.startsWith("ok:") ? "w-full text-sm text-brand-700" : "w-full text-sm text-red-600"}>{msg.startsWith("ok:") ? `Envoyé à ${msg.slice(3)}.` : msg}</p>}
    </form>
  );
}

"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

export function SubmitButton({ label = "Enregistrer" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary !py-2.5">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {label}
    </button>
  );
}

export function DeleteButton({ action, label = "Supprimer", confirmText = "Supprimer définitivement cet élément ?" }: { action: () => Promise<void>; label?: string; confirmText?: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(confirmText)) e.preventDefault(); }}>
      <button type="submit" className="btn !py-2.5 text-red-600 hover:bg-red-50">
        <Trash2 className="h-4 w-4" aria-hidden /> {label}
      </button>
    </form>
  );
}

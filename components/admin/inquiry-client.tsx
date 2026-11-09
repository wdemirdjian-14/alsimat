"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, CheckCircle2, Loader2, Mail, Phone } from "lucide-react";
import { setInquiryStatus } from "@/app/admin/actions/inquiries";
import { INQUIRY_STATUS } from "@/lib/inquiry-labels";
import { cn } from "@/lib/utils";

/** Statut en un geste : pastilles larges, faciles au pouce. */
export function StatusPills({ id, value }: { id: string; value: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState(value);
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(INQUIRY_STATUS).map(([k, v]) => (
        <button key={k} type="button" disabled={pending}
          onClick={() => { setCurrent(k); start(async () => { await setInquiryStatus(id, k); router.refresh(); }); }}
          className={cn("rounded-xl border px-3 py-2.5 text-sm font-semibold transition", current === k ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink/70 hover:border-ink/30")}>
          {v.label}
        </button>
      ))}
    </div>
  );
}

/** Barre d'actions collée en bas de l'écran sur mobile (au-dessus des onglets). */
export function MobileActionBar({ id, phone, status }: { id: string; phone?: string | null; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const done = status === "traite";
  const btn = "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-semibold";
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.9rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 lg:hidden">
      <div className="flex gap-2 rounded-2xl border border-ink/10 bg-white/95 p-1.5 shadow-lg backdrop-blur">
        {phone && <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={cn(btn, "bg-brand-500 text-white")}><Phone className="h-5 w-5" /> Appeler</a>}
        <a href="#repondre" className={cn(btn, "bg-ink text-white")}><Mail className="h-5 w-5" /> Répondre</a>
        <button type="button" disabled={pending}
          onClick={() => start(async () => { await setInquiryStatus(id, done ? "archive" : "traite"); router.refresh(); })}
          className={cn(btn, "bg-sand text-ink")}>
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : done ? <Archive className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          {done ? "Archiver" : "Traité"}
        </button>
      </div>
    </div>
  );
}

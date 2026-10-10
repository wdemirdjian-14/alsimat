"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteFormProps {
  source?: string;
  vehicleRef?: string;
  config?: any;
  totalHt?: number | null;
  compact?: boolean;
  title?: string;
}

export function QuoteForm({ source, vehicleRef, config, totalHt, compact, title }: QuoteFormProps) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("Merci de renseigner votre nom, prénom et email");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source, vehicleRef, config, totalHt }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      toast.success("Votre demande a bien été envoyée");
    } catch {
      toast.error("Une erreur est survenue, merci de réessayer");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-[#7FBF7F] mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-[#2d3436]">Demande envoyée !</h3>
        <p className="text-gray-500 mt-1">Notre équipe vous recontactera dans les plus brefs délais.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-[#2d3436]">{title}</h3>}
      <div className={compact ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        <div><Label>Prénom *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
        <div><Label>Nom *</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
        <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
      <div><Label>Message</Label><Textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Précisez votre besoin..." /></div>
      <Button type="submit" disabled={saving} className="w-full bg-[#7FBF7F] hover:bg-[#6aad6a] text-white rounded-full py-6">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Envoyer ma demande de devis
      </Button>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Sliders, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Option { id: string; name: string; description: string | null; priceDelta: number }
interface Group { id: string; name: string; subtitle: string | null; required: boolean; options: Option[] }
interface Model { id: string; name: string; subtitle: string | null; basePrice: number; image: string | null; groups: Group[] }

const euro = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function ConfiguratorClient({ models }: { models: Model[] }) {
  const [modelId, setModelId] = useState<string | null>(models[0]?.id ?? null);
  const model = models.find((m) => m.id === modelId) ?? null;

  // selection: groupId -> optionId
  const initSelection = (m: Model | null) => {
    const sel: Record<string, string> = {};
    m?.groups.forEach((g) => {
      if (g.options[0]) sel[g.id] = g.options[0].id;
    });
    return sel;
  };
  const [selection, setSelection] = useState<Record<string, string>>(initSelection(models[0] ?? null));

  const chooseModel = (id: string) => {
    setModelId(id);
    const m = models.find((x) => x.id === id) ?? null;
    setSelection(initSelection(m));
  };

  const totalHt = useMemo(() => {
    if (!model) return 0;
    let t = model.basePrice;
    model.groups.forEach((g) => {
      const opt = g.options.find((o) => o.id === selection[g.id]);
      if (opt) t += opt.priceDelta;
    });
    return t;
  }, [model, selection]);

  const configSummary = useMemo(() => {
    if (!model) return [] as { group: string; option: string; priceDelta: number }[];
    return model.groups.map((g) => {
      const opt = g.options.find((o) => o.id === selection[g.id]);
      return { group: g.name, option: opt?.name ?? "-", priceDelta: opt?.priceDelta ?? 0 };
    });
  }, [model, selection]);

  if (!models.length) {
    return (
      <section className="pt-32 pb-24 bg-white min-h-[60vh]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Sliders className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h1 className="text-2xl font-display font-bold text-[#2d3436]">Configurateur</h1>
          <p className="text-gray-500 mt-2">Aucun modèle disponible pour le moment. Revenez bientôt !</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pt-28 pb-8 bg-[#2d3436] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <p className="text-[#7FBF7F] text-sm font-semibold uppercase tracking-wider mb-2">Configurateur</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Composez votre véhicule</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Choisissez votre modèle et vos options, le prix se met à jour en temps réel. Demandez ensuite votre devis personnalisé.
          </p>
        </div>
      </section>

      {/* Model selector */}
      {models.length > 1 && (
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 py-5 flex gap-3 overflow-x-auto">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => chooseModel(m.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  m.id === modelId ? "bg-[#7FBF7F] text-white" : "bg-white text-[#2d3436] border border-gray-200 hover:border-[#7FBF7F]"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="py-10 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Options */}
          <div className="lg:col-span-2 space-y-8">
            {model?.groups.map((g) => (
              <div key={g.id}>
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-[#2d3436]">
                    {g.name}
                    {g.required && <span className="text-[#7FBF7F] ml-1">*</span>}
                  </h2>
                  {g.subtitle && <p className="text-sm text-gray-500">{g.subtitle}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {g.options.map((o) => {
                    const selected = selection[g.id] === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => setSelection((s) => ({ ...s, [g.id]: o.id }))}
                        className={`text-left rounded-xl border-2 p-4 transition-all ${
                          selected ? "border-[#7FBF7F] bg-[#7FBF7F]/5" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-[#2d3436]">{o.name}</p>
                            {o.description && <p className="text-xs text-gray-500 mt-0.5">{o.description}</p>}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              selected ? "bg-[#7FBF7F] text-white" : "border border-gray-300"
                            }`}
                          >
                            {selected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#7FBF7F] mt-2">
                          {o.priceDelta === 0 ? "Inclus" : `+ ${euro(o.priceDelta)}`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-[4/3] bg-gray-100">
                {model?.image ? (
                  <Image src={model.image} alt={model.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Sliders className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#2d3436]">{model?.name}</h3>
                {model?.subtitle && <p className="text-sm text-gray-500">{model.subtitle}</p>}

                <div className="mt-4 space-y-1.5 text-sm border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Prix de base</span>
                    <span>{euro(model?.basePrice ?? 0)}</span>
                  </div>
                  {configSummary.filter((c) => c.priceDelta !== 0).map((c, i) => (
                    <div key={i} className="flex justify-between text-gray-500">
                      <span className="truncate mr-2">{c.option}</span>
                      <span>+ {euro(c.priceDelta)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#2d3436] font-semibold">Total HT</span>
                    <span className="text-2xl font-bold text-[#7FBF7F]">{euro(totalHt)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Total TTC (TVA 20%)</span>
                    <span>{euro(totalHt * 1.2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-[720px] mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-[#2d3436]">Demander un devis</h2>
              <p className="text-gray-500 mt-1">
                Votre configuration <strong className="text-[#2d3436]">{model?.name}</strong> — Total HT estimé : {euro(totalHt)}
              </p>
            </div>
            <ConfigQuoteForm modelName={model?.name ?? ""} config={configSummary} totalHt={totalHt} />
          </div>
        </div>
      </section>
    </>
  );
}

function ConfigQuoteForm({
  modelName,
  config,
  totalHt,
}: {
  modelName: string;
  config: { group: string; option: string; priceDelta: number }[];
  totalHt: number;
}) {
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
        body: JSON.stringify({ ...form, source: "Configurateur", vehicleRef: modelName, config, totalHt }),
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
        <p className="text-gray-500 mt-1">Notre équipe vous recontactera avec votre devis personnalisé.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Prénom *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
        <div><Label>Nom *</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
        <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
      <div><Label>Message</Label><Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Précisez votre besoin..." /></div>
      <Button type="submit" disabled={saving} className="w-full bg-[#7FBF7F] hover:bg-[#6aad6a] text-white rounded-full py-6">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Envoyer ma demande de devis
      </Button>
    </form>
  );
}

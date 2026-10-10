"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ContactClient() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res?.ok) {
        setSent(true);
        toast.success("Message envoyé avec succès !");
      } else {
        toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    } catch {
      toast.error("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="relative pt-32 pb-16 bg-[#2d3436] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">
            Contact / Devis
          </h1>
          <p className="text-gray-400 text-lg">
            Une question ? Un projet ? Contactez-nous
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-green-50 rounded-2xl"
                >
                  <CheckCircle className="w-16 h-16 text-[#7FBF7F] mx-auto mb-4" />
                  <h2 className="text-2xl font-display font-bold text-[#2d3436] mb-2">
                    Message envoyé !
                  </h2>
                  <p className="text-gray-500">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="mt-6 bg-[#7FBF7F] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#6aad6a] transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#2d3436] mb-1.5">Nom complet *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e: any) => setForm({ ...(form ?? {}), name: e?.target?.value ?? '' })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all text-[#2d3436]"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d3436] mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e: any) => setForm({ ...(form ?? {}), email: e?.target?.value ?? '' })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all text-[#2d3436]"
                        placeholder="jean@exemple.fr"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#2d3436] mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e: any) => setForm({ ...(form ?? {}), phone: e?.target?.value ?? '' })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all text-[#2d3436]"
                        placeholder="06 XX XX XX XX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d3436] mb-1.5">Objet</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e: any) => setForm({ ...(form ?? {}), subject: e?.target?.value ?? '' })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all text-[#2d3436]"
                        placeholder="Demande de devis"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d3436] mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e: any) => setForm({ ...(form ?? {}), message: e?.target?.value ?? '' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all resize-none text-[#2d3436]"
                      placeholder="Votre message..."
                    />
                  </div>
                  <p className="text-xs text-gray-400">Vos données sont stockées de manière sécurisée et ne seront pas partagées.</p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#7FBF7F] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#6aad6a] transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Envoyer le message
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#2d3436] mb-4">Nos coordonnées</h3>
                <div className="space-y-4">
                  <a href="tel:+33620376133" className="flex items-center gap-3 text-gray-600 hover:text-[#7FBF7F] transition-colors">
                    <div className="w-10 h-10 bg-[#7FBF7F]/10 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#7FBF7F]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Téléphone</p>
                      <p className="font-medium" suppressHydrationWarning>06 20 37 61 33</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 bg-[#7FBF7F]/10 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#7FBF7F]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium" suppressHydrationWarning>contact@alsimat.fr</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 bg-[#7FBF7F]/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#7FBF7F]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Adresse</p>
                      <p className="font-medium">France</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#7FBF7F]/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#2d3436] mb-2">Besoin d'un SAV ?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Pour une demande de service après-vente, utilisez notre formulaire dédié.
                </p>
                <a
                  href="/sav"
                  className="inline-flex items-center gap-2 bg-[#7FBF7F] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#6aad6a] transition-colors"
                >
                  Formulaire SAV
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Send, CheckCircle, Loader2, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";

export function SavClient() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    serialNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    description: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e?.target?.files ?? []);
    setFiles((prev: File[]) => [...(prev ?? []), ...newFiles]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev: File[]) => (prev ?? []).filter((_: File, i: number) => i !== idx));
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Get presigned URL
    const presignRes = await fetch("/api/upload/presigned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file?.name ?? 'file',
        contentType: file?.type ?? 'application/octet-stream',
        isPublic: false,
      }),
    });
    const presignData = await presignRes?.json?.();
    const uploadUrl = presignData?.uploadUrl ?? '';
    const cloud_storage_path = presignData?.cloud_storage_path ?? '';

    // Upload to S3
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file?.type ?? 'application/octet-stream' },
      body: file,
    });

    return cloud_storage_path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    try {
      // Upload files
      const uploadedPaths: string[] = [];
      for (const file of files ?? []) {
        const path = await uploadFile(file);
        uploadedPaths.push(path);
      }

      const res = await fetch("/api/sav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(form ?? {}),
          files: uploadedPaths,
        }),
      });

      if (res?.ok) {
        setSent(true);
        toast.success("Ticket SAV créé avec succès !");
      } else {
        toast.error("Erreur lors de la création du ticket.");
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
          <div className="flex items-center gap-3 mb-3">
            <Wrench className="w-8 h-8 text-[#7FBF7F]" />
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Demander votre SAV
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Soumettez une demande de service après-vente
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[700px] mx-auto px-4">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-green-50 rounded-2xl"
            >
              <CheckCircle className="w-16 h-16 text-[#7FBF7F] mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-[#2d3436] mb-2">
                Ticket SAV créé !
              </h2>
              <p className="text-gray-500 mb-2">
                Votre demande a bien été enregistrée.
              </p>
              <p className="text-gray-400 text-sm">
                Nous vous recontacterons dans les meilleurs délais.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2d3436] mb-1.5">
                  Numéro de série du véhicule *
                </label>
                <input
                  type="text"
                  required
                  value={form.serialNumber}
                  onChange={(e: any) => setForm({ ...(form ?? {}), serialNumber: e?.target?.value ?? '' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all text-[#2d3436]"
                  placeholder="Ex: ALM-2024-001"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#2d3436] mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e: any) => setForm({ ...(form ?? {}), firstName: e?.target?.value ?? '' })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all text-[#2d3436]"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3436] mb-1.5">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e: any) => setForm({ ...(form ?? {}), lastName: e?.target?.value ?? '' })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all text-[#2d3436]"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <div>
                  <label className="block text-sm font-medium text-[#2d3436] mb-1.5">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e: any) => setForm({ ...(form ?? {}), phone: e?.target?.value ?? '' })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all text-[#2d3436]"
                    placeholder="06 XX XX XX XX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d3436] mb-1.5">
                  Description de la panne *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(e: any) => setForm({ ...(form ?? {}), description: e?.target?.value ?? '' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7FBF7F] focus:ring-2 focus:ring-[#7FBF7F]/20 outline-none transition-all resize-none text-[#2d3436]"
                  placeholder="Décrivez le problème rencontré..."
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-[#2d3436] mb-1.5">
                  Photos / Vidéos (optionnel)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#7FBF7F] transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Glissez vos fichiers ici ou</p>
                  <label className="inline-flex items-center gap-2 bg-gray-100 text-[#2d3436] px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    Parcourir
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {(files?.length ?? 0) > 0 && (
                  <div className="mt-3 space-y-2">
                    {(files ?? []).map((f: File, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                        <FileText className="w-4 h-4 text-[#7FBF7F]" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{f?.name ?? 'Fichier'}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400">Vos données sont stockées de manière sécurisée et ne seront pas partagées.</p>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#7FBF7F] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#6aad6a] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer la demande SAV
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

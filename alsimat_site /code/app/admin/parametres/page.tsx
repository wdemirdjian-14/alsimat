'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ToggleDef {
  key: string;
  label: string;
  description: string;
}

const TOGGLES: ToggleDef[] = [
  {
    key: 'realisations_visible',
    label: 'Section Réalisations',
    description: 'Affiche la page Réalisations et son lien dans le menu.',
  },
  {
    key: 'occasion_visible',
    label: 'Page Occasion',
    description: 'Affiche la page des véhicules d\'occasion et son lien dans le menu.',
  },
  {
    key: 'promotions_visible',
    label: 'Promotions',
    description: 'Affiche la page Promotions, le bloc promotions de l\'accueil et le lien du menu.',
  },
  {
    key: 'configurateur_visible',
    label: 'Configurateur',
    description: 'Affiche le configurateur de véhicule et son lien dans le menu.',
  },
];

export default function AdminParametresPage() {
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error();
      const map = await res.json();
      const next: Record<string, boolean> = {};
      for (const t of TOGGLES) {
        next[t.key] = map[t.key] === undefined ? true : map[t.key] === 'true';
      }
      setValues(next);
    } catch {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      for (const t of TOGGLES) payload[t.key] = String(values[t.key]);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success('Paramètres enregistrés');
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-1">
            Activez ou masquez des sections du site sans supprimer leur contenu.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Enregistrer
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {TOGGLES.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-2 ${values[t.key] ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                  {values[t.key] ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.label}</p>
                  <p className="text-sm text-gray-500">{t.description}</p>
                </div>
              </div>
              <Switch
                checked={values[t.key] ?? true}
                onCheckedChange={(c) => setValues((prev) => ({ ...prev, [t.key]: c }))}
              />
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

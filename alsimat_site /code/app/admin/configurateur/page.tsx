'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AdminShell } from '@/components/admin/admin-shell';
import { ImageUploader } from '@/components/admin/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Sliders, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Option { name: string; description: string; priceDelta: number }
interface Group { name: string; subtitle: string; required: boolean; options: Option[] }
interface Model {
  id: string; name: string; subtitle: string | null; basePrice: number;
  image: string | null; active: boolean; order: number;
  groups: { id: string; name: string; subtitle: string | null; required: boolean; options: { id: string; name: string; description: string | null; priceDelta: number }[] }[];
}

const emptyForm = {
  name: '', subtitle: '', basePrice: 0, image: '', active: true, order: 0,
  groups: [] as Group[],
};

export default function AdminConfiguratorPage() {
  const [items, setItems] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/configurator');
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch { toast.error('Erreur lors du chargement'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: items.length, groups: [] });
    setDialogOpen(true);
  };
  const openEdit = (m: Model) => {
    setEditing(m);
    setForm({
      name: m.name, subtitle: m.subtitle ?? '', basePrice: m.basePrice,
      image: m.image ?? '', active: m.active, order: m.order,
      groups: m.groups.map((g) => ({
        name: g.name, subtitle: g.subtitle ?? '', required: g.required,
        options: g.options.map((o) => ({ name: o.name, description: o.description ?? '', priceDelta: o.priceDelta })),
      })),
    });
    setDialogOpen(true);
  };

  // group/option mutators
  const addGroup = () => setForm((f) => ({ ...f, groups: [...f.groups, { name: '', subtitle: '', required: false, options: [{ name: '', description: '', priceDelta: 0 }] }] }));
  const removeGroup = (gi: number) => setForm((f) => ({ ...f, groups: f.groups.filter((_, i) => i !== gi) }));
  const updateGroup = (gi: number, patch: Partial<Group>) => setForm((f) => ({ ...f, groups: f.groups.map((g, i) => i === gi ? { ...g, ...patch } : g) }));
  const addOption = (gi: number) => setForm((f) => ({ ...f, groups: f.groups.map((g, i) => i === gi ? { ...g, options: [...g.options, { name: '', description: '', priceDelta: 0 }] } : g) }));
  const removeOption = (gi: number, oi: number) => setForm((f) => ({ ...f, groups: f.groups.map((g, i) => i === gi ? { ...g, options: g.options.filter((_, j) => j !== oi) } : g) }));
  const updateOption = (gi: number, oi: number, patch: Partial<Option>) => setForm((f) => ({ ...f, groups: f.groups.map((g, i) => i === gi ? { ...g, options: g.options.map((o, j) => j === oi ? { ...o, ...patch } : o) } : g) }));

  const save = async () => {
    if (!form.name.trim()) { toast.error('Le nom du modèle est requis'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name, subtitle: form.subtitle || null, basePrice: Number(form.basePrice) || 0,
        image: form.image || null, active: form.active, order: Number(form.order) || 0,
        groups: form.groups.map((g) => ({
          name: g.name, subtitle: g.subtitle || null, required: g.required,
          options: g.options.map((o) => ({ name: o.name, description: o.description || null, priceDelta: Number(o.priceDelta) || 0 })),
        })),
      };
      const res = await fetch(editing ? `/api/admin/configurator/${editing.id}` : '/api/admin/configurator', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? 'Modèle mis à jour' : 'Modèle créé');
      setDialogOpen(false);
      load();
    } catch { toast.error('Erreur lors de l\'enregistrement'); } finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/configurator/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Modèle supprimé');
      load();
    } catch { toast.error('Erreur lors de la suppression'); } finally { setDeleteId(null); }
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2d3436] flex items-center gap-2"><Sliders className="w-6 h-6 text-[#7FBF7F]" /> Configurateur</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les modèles configurables, leurs groupes d'options et les prix.</p>
        </div>
        <Button onClick={openCreate} className="bg-[#7FBF7F] hover:bg-[#6aad6a] text-white"><Plus className="w-4 h-4 mr-1" /> Nouveau modèle</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#7FBF7F]" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Sliders className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun modèle configurable. Créez-en un pour activer le configurateur.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] bg-gray-100">
                {m.image && <Image src={m.image} alt={m.name} fill className="object-cover" />}
                {!m.active && <div className="absolute top-2 left-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">Masqué</div>}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#2d3436]">{m.name}</h3>
                {m.subtitle && <p className="text-xs text-gray-500">{m.subtitle}</p>}
                <p className="text-sm text-[#7FBF7F] font-semibold mt-1">à partir de {m.basePrice.toLocaleString('fr-FR')} € HT</p>
                <p className="text-xs text-gray-400 mt-1">{m.groups.length} groupe(s) d'options</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(m)}><Pencil className="w-3.5 h-3.5 mr-1" /> Éditer</Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setDeleteId(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Modifier le modèle' : 'Nouveau modèle'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Nom du modèle *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Sous-titre</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
              <div><Label>Prix de base (€ HT)</Label><Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /></div>
              <div><Label>Ordre d'affichage</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Image du modèle</Label>
              <ImageUploader images={form.image ? [form.image] : []} onChange={(imgs) => setForm({ ...form, image: imgs[0] ?? '' })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label className="cursor-pointer">Modèle visible sur le site</Label>
            </div>

            {/* Groups */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#2d3436]">Groupes d'options</h3>
                <Button type="button" variant="outline" size="sm" onClick={addGroup}><Plus className="w-3.5 h-3.5 mr-1" /> Ajouter un groupe</Button>
              </div>
              <div className="space-y-4">
                {form.groups.map((g, gi) => (
                  <div key={gi} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label className="text-xs">Nom du groupe (ex: Couleur)</Label><Input value={g.name} onChange={(e) => updateGroup(gi, { name: e.target.value })} /></div>
                      <div><Label className="text-xs">Sous-titre</Label><Input value={g.subtitle} onChange={(e) => updateGroup(gi, { subtitle: e.target.value })} /></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Switch checked={g.required} onCheckedChange={(v) => updateGroup(gi, { required: v })} />
                        <Label className="text-xs cursor-pointer">Choix obligatoire</Label>
                      </div>
                      <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => removeGroup(gi)}><Trash2 className="w-3.5 h-3.5 mr-1" /> Supprimer le groupe</Button>
                    </div>
                    {/* Options */}
                    <div className="mt-3 space-y-2">
                      {g.options.map((o, oi) => (
                        <div key={oi} className="grid grid-cols-12 gap-2 items-center bg-white rounded-lg p-2 border border-gray-100">
                          <Input className="col-span-4" placeholder="Nom option" value={o.name} onChange={(e) => updateOption(gi, oi, { name: e.target.value })} />
                          <Input className="col-span-5" placeholder="Description (optionnel)" value={o.description} onChange={(e) => updateOption(gi, oi, { description: e.target.value })} />
                          <Input className="col-span-2" type="number" placeholder="+€" value={o.priceDelta} onChange={(e) => updateOption(gi, oi, { priceDelta: Number(e.target.value) })} />
                          <Button type="button" variant="ghost" size="icon" className="col-span-1 text-red-500" onClick={() => removeOption(gi, oi)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addOption(gi)}><Plus className="w-3.5 h-3.5 mr-1" /> Ajouter une option</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving} className="bg-[#7FBF7F] hover:bg-[#6aad6a] text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce modèle ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible. Le modèle et toutes ses options seront supprimés.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-500 hover:bg-red-600">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

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
import { Plus, Pencil, Trash2, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Promotion {
  id: string; title: string; description: string | null; image: string | null;
  discount: string | null; badge: string | null; ctaLabel: string | null; ctaLink: string | null;
  active: boolean; order: number;
}

const emptyForm = {
  title: '', description: '', image: '', discount: '', badge: '',
  ctaLabel: '', ctaLink: '', active: true, order: 0,
};

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promotions');
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch { toast.error('Erreur lors du chargement'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, order: items.length }); setDialogOpen(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description ?? '', image: p.image ?? '',
      discount: p.discount ?? '', badge: p.badge ?? '', ctaLabel: p.ctaLabel ?? '',
      ctaLink: p.ctaLink ?? '', active: p.active, order: p.order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Le titre est requis'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/promotions/${editing.id}` : '/api/admin/promotions';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? 'Promotion mise à jour' : 'Promotion ajoutée');
      setDialogOpen(false);
      load();
    } catch { toast.error("Erreur lors de l'enregistrement"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/promotions/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Promotion supprimée');
      setItems((prev) => prev.filter((p) => p.id !== deleteId));
    } catch { toast.error('Erreur lors de la suppression'); } finally { setDeleteId(null); }
  };

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-500 mt-1">Gérez les offres promotionnelles affichées sur le site</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <Tag className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 text-gray-500">Aucune promotion</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-video bg-muted">
                {p.image ? <Image src={p.image} alt={p.title} fill className="object-cover" /> : <div className="flex h-full items-center justify-center"><Tag className="h-10 w-10 text-gray-300" /></div>}
                {(p.badge || p.discount) && <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">{p.badge || p.discount}</div>}
                {!p.active && <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded">Inactif</div>}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{p.title}</h3>
                {p.description && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.description}</p>}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="mr-1 h-3.5 w-3.5" /> Modifier</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Modifier la promotion' : 'Nouvelle promotion'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Titre *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex : Offre de printemps" /></div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Badge / Réduction</Label><Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Ex : -15%" /></div>
              <div><Label>Ordre</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Texte du bouton</Label><Input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="Ex : En profiter" /></div>
              <div><Label>Lien du bouton</Label><Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="Ex : /contact" /></div>
            </div>
            <div><Label>Image</Label><ImageUploader images={form.image ? [form.image] : []} onChange={(imgs) => setForm({ ...form, image: imgs[0] ?? '' })} multiple={false} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} /><Label className="!mb-0">Active (visible sur le site)</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? 'Enregistrer' : 'Ajouter'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer cette promotion ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

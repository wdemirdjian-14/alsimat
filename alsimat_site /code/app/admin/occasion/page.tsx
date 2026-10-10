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
import { Plus, Pencil, Trash2, Car, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UsedVehicle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string | null;
  year: string | null;
  mileage: string | null;
  condition: string | null;
  images: string[];
  sold: boolean;
  featured: boolean;
}

const emptyForm = {
  name: '', description: '', price: '', year: '', mileage: '', condition: '',
  images: [] as string[], sold: false, featured: false,
};

export default function AdminOccasionPage() {
  const [items, setItems] = useState<UsedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UsedVehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/used-vehicles');
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (v: UsedVehicle) => {
    setEditing(v);
    setForm({
      name: v.name, description: v.description ?? '', price: v.price ?? '',
      year: v.year ?? '', mileage: v.mileage ?? '', condition: v.condition ?? '',
      images: v.images ?? [], sold: v.sold, featured: v.featured,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/used-vehicles/${editing.id}` : '/api/admin/used-vehicles';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? 'Véhicule mis à jour' : 'Véhicule ajouté');
      setDialogOpen(false);
      load();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/used-vehicles/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Véhicule supprimé');
      setItems((prev) => prev.filter((v) => v.id !== deleteId));
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Véhicules d'occasion</h1>
          <p className="text-gray-500 mt-1">Gérez les véhicules d'occasion proposés à la vente</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <Car className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">Aucun véhicule d'occasion</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-video bg-muted">
                {v.images?.[0] ? (
                  <Image src={v.images[0]} alt={v.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Car className="h-10 w-10 text-gray-300" /></div>
                )}
                {v.sold && <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Vendu</div>}
                {v.featured && !v.sold && <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">À la une</div>}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{v.name}</h3>
                <p className="text-sm text-primary font-medium">{v.price || 'Prix sur demande'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{[v.year, v.mileage].filter(Boolean).join(' • ')}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(v)}><Pencil className="mr-1 h-3.5 w-3.5" /> Modifier</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteId(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Modifier le véhicule' : 'Nouveau véhicule d\'occasion'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Tracteur Ebox 2022" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prix</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Ex : 12 900 €" /></div>
              <div><Label>Année</Label><Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Ex : 2022" /></div>
              <div><Label>Kilométrage / heures</Label><Input value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} placeholder="Ex : 1 200 h" /></div>
              <div><Label>État</Label><Input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="Ex : Excellent" /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le véhicule, son équipement..." /></div>
            <div><Label>Photos</Label><ImageUploader images={form.images} onChange={(imgs) => setForm({ ...form, images: imgs })} multiple /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: c })} /><Label className="!mb-0">À la une</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.sold} onCheckedChange={(c) => setForm({ ...form, sold: c })} /><Label className="!mb-0">Vendu</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { ImageUploader } from '@/components/admin/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Truck, X } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}
interface VehicleCategory {
  category: Category;
}
interface Vehicle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string | null;
  characteristics: Record<string, string> | null;
  images: string[];
  featured: boolean;
  categories: VehicleCategory[];
}

interface CharRow {
  key: string;
  value: string;
}

const emptyForm = {
  name: '',
  shortDescription: '',
  description: '',
  price: '',
  images: [] as string[],
  featured: false,
  categoryIds: [] as string[],
};

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [chars, setChars] = useState<CharRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/vehicles').then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
    ])
      .then(([v, c]) => {
        setVehicles(Array.isArray(v) ? v : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setChars([]);
    setDialogOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      name: v.name,
      shortDescription: v.shortDescription || '',
      description: v.description || '',
      price: v.price || '',
      images: v.images || [],
      featured: v.featured,
      categoryIds: v.categories.map((c) => c.category.id),
    });
    setChars(
      Object.entries(v.characteristics || {}).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    );
    setDialogOpen(true);
  };

  const toggleCategory = (id: string) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    setSaving(true);
    const characteristics: Record<string, string> = {};
    chars.forEach((row) => {
      if (row.key.trim()) characteristics[row.key.trim()] = row.value;
    });
    try {
      const url = editing ? `/api/admin/vehicles/${editing.id}` : '/api/admin/vehicles';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, characteristics }),
      });
      if (res.ok) {
        toast.success(editing ? 'Véhicule modifié' : 'Véhicule créé');
        setDialogOpen(false);
        load();
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/vehicles/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Véhicule supprimé');
        load();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Véhicules</h1>
          <p className="text-gray-500 mt-1">Gérez votre catalogue de véhicules</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Nouveau véhicule
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun véhicule</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="divide-y">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {v.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{v.name}</h3>
                    {v.featured && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        À la une
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {v.categories.map((c) => c.category.name).join(', ') || 'Aucune catégorie'}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(v)}
                    className="p-2 rounded-md text-gray-400 hover:text-primary hover:bg-primary/5"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(v.id)}
                    className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le véhicule' : 'Nouveau véhicule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Description courte</Label>
              <Textarea
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description complète</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prix</Label>
              <Input
                id="price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Sur devis"
              />
            </div>

            <div className="space-y-2">
              <Label>Catégories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.categoryIds.includes(c.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-400">Créez d&apos;abord des catégories</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <ImageUploader
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
              />
            </div>

            <div className="space-y-2">
              <Label>Caractéristiques techniques</Label>
              <div className="space-y-2">
                {chars.map((row, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="Ex: Motorisation"
                      value={row.key}
                      onChange={(e) => {
                        const next = [...chars];
                        next[idx].key = e.target.value;
                        setChars(next);
                      }}
                    />
                    <Input
                      placeholder="Ex: 4 kW électrique"
                      value={row.value}
                      onChange={(e) => {
                        const next = [...chars];
                        next[idx].value = e.target.value;
                        setChars(next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setChars(chars.filter((_, i) => i !== idx))}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setChars([...chars, { key: '', value: '' }])}
                >
                  <Plus className="w-3 h-3 mr-1" /> Ajouter une caractéristique
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
              />
              <Label className="cursor-pointer">Mettre en avant sur l&apos;accueil</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Wrench, Trash2, Eye, Paperclip, Mail, Phone, Hash, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SavTicket {
  id: string;
  serialNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  description: string;
  files: string[];
  status: string;
  createdAt: string;
}

const STATUSES = ['Nouveau', 'En cours', 'Résolu', 'Fermé'];

const statusColors: Record<string, string> = {
  Nouveau: 'bg-blue-100 text-blue-700',
  'En cours': 'bg-amber-100 text-amber-700',
  'Résolu': 'bg-green-100 text-green-700',
  'Fermé': 'bg-gray-100 text-gray-600',
};

export default function AdminSavPage() {
  const [tickets, setTickets] = useState<SavTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [selected, setSelected] = useState<SavTicket | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/sav')
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/sav/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('Statut mis à jour');
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
        setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
      } else {
        toast.error('Erreur');
      }
    } catch {
      toast.error('Erreur de connexion');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/sav/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Ticket supprimé');
        load();
      } else {
        toast.error('Erreur');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setDeleteId(null);
    }
  };

  const openFile = async (path: string) => {
    setFileLoading(path);
    try {
      const res = await fetch('/api/admin/file-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloud_storage_path: path }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error('Fichier introuvable');
      }
    } catch {
      toast.error('Erreur');
    } finally {
      setFileLoading(null);
    }
  };

  const filtered = filter === 'Tous' ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tickets SAV</h1>
          <p className="text-gray-500 mt-1">Gérez les demandes de service après-vente</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tous">Tous les statuts</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun ticket SAV</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status] || 'bg-gray-100 text-gray-600'}`}>
                      {t.status}
                    </span>
                    <h3 className="font-semibold text-gray-900">
                      {t.firstName} {t.lastName}
                    </h3>
                    {t.files?.length > 0 && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> {t.files.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" /> {t.serialNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(t.createdAt).toLocaleDateString('fr-FR', { timeZone: 'UTC' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-1">{t.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v)}>
                    <SelectTrigger className="w-36 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => setSelected(t)}
                    className="p-2 rounded-md text-gray-400 hover:text-primary hover:bg-primary/5"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail du ticket SAV</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[selected.status] || 'bg-gray-100 text-gray-600'}`}>
                  {selected.status}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Hash className="w-4 h-4 text-gray-400" /> N° série : <strong>{selected.serialNumber}</strong>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                    {selected.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${selected.phone}`} className="text-primary hover:underline">
                    {selected.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(selected.createdAt).toLocaleString('fr-FR', { timeZone: 'UTC' })}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Description de la panne</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                  {selected.description}
                </p>
              </div>
              {selected.files?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Pièces jointes ({selected.files.length})
                  </p>
                  <div className="space-y-2">
                    {selected.files.map((f, idx) => (
                      <button
                        key={idx}
                        onClick={() => openFile(f)}
                        disabled={fileLoading === f}
                        className="w-full flex items-center gap-2 text-sm text-primary hover:underline bg-primary/5 rounded-lg px-3 py-2"
                      >
                        {fileLoading === f ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                        Fichier {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Changer le statut</p>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce ticket ?</AlertDialogTitle>
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

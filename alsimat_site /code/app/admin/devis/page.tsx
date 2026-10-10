'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, Trash2, FileSignature, Loader2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Quote {
  id: string; firstName: string; lastName: string; email: string; phone: string | null;
  message: string | null; source: string | null; vehicleRef: string | null;
  config: any; totalHt: number | null; status: string; createdAt: string;
}

const STATUSES = ['Nouveau', 'En cours', 'Traité', 'Clos'];
const statusColor: Record<string, string> = {
  'Nouveau': 'bg-blue-100 text-blue-700',
  'En cours': 'bg-amber-100 text-amber-700',
  'Traité': 'bg-green-100 text-green-700',
  'Clos': 'bg-gray-100 text-gray-600',
};

export default function AdminDevisPage() {
  const [items, setItems] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/quotes');
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch { toast.error('Erreur lors du chargement'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
      toast.success('Statut mis à jour');
    } catch { toast.error('Erreur lors de la mise à jour'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/quotes/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((q) => q.id !== deleteId));
      toast.success('Demande supprimée');
    } catch { toast.error('Erreur lors de la suppression'); } finally { setDeleteId(null); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' });
  const fmtPrice = (n: number | null) => (n == null ? '—' : `${n.toLocaleString('fr-FR')} €`);

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Demandes de devis</h1>
        <p className="text-gray-500 mt-1">Demandes envoyées depuis le configurateur, les occasions et le formulaire de contact</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <FileSignature className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 text-gray-500">Aucune demande de devis</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Total HT</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(q.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{q.firstName} {q.lastName}</p>
                    <p className="text-gray-400">{q.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{q.source || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtPrice(q.totalHt)}</td>
                  <td className="px-4 py-3">
                    <Select value={q.status} onValueChange={(v) => updateStatus(q.id, v)}>
                      <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewing(q)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteId(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Demande de devis</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={statusColor[viewing.status] || ''}>{viewing.status}</Badge>
                {viewing.source && <span className="text-gray-400">via {viewing.source}</span>}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">{viewing.firstName} {viewing.lastName}</p>
                <a href={`mailto:${viewing.email}`} className="flex items-center gap-1.5 text-primary mt-1"><Mail className="h-3.5 w-3.5" /> {viewing.email}</a>
                {viewing.phone && <a href={`tel:${viewing.phone}`} className="flex items-center gap-1.5 text-primary mt-1"><Phone className="h-3.5 w-3.5" /> {viewing.phone}</a>}
              </div>
              {viewing.vehicleRef && <div><p className="text-gray-400">Véhicule concerné</p><p className="text-gray-900">{viewing.vehicleRef}</p></div>}
              {viewing.totalHt != null && (
                <div><p className="text-gray-400">Total estimé</p>
                  <p className="text-gray-900">{fmtPrice(viewing.totalHt)} HT — {(viewing.totalHt * 1.2).toLocaleString('fr-FR')} € TTC</p></div>
              )}
              {viewing.config && Array.isArray(viewing.config) && viewing.config.length > 0 && (
                <div><p className="text-gray-400 mb-1">Configuration choisie</p>
                  <div className="rounded-lg bg-gray-50 p-3 space-y-1">
                    {viewing.config.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between"><span className="text-gray-600">{c.group} : {c.option}</span><span className="text-gray-900">{c.priceDelta ? `+${c.priceDelta.toLocaleString('fr-FR')} €` : 'Inclus'}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {viewing.message && <div><p className="text-gray-400">Message</p><p className="text-gray-900 whitespace-pre-wrap">{viewing.message}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Truck, FolderTree, Wrench, Mail, Image as ImageIcon } from 'lucide-react';

interface DashboardStats {
  vehicles: number;
  categories: number;
  savTickets: number;
  contacts: number;
  projects: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const cards = [
    { icon: Truck, label: 'Véhicules', href: '/admin/vehicules', count: stats?.vehicles },
    { icon: FolderTree, label: 'Catégories', href: '/admin/categories', count: stats?.categories },
    { icon: Wrench, label: 'Tickets SAV', href: '/admin/sav', count: stats?.savTickets },
    { icon: Mail, label: 'Contacts', href: '/admin/contacts', count: stats?.contacts },
    { icon: ImageIcon, label: 'Réalisations', href: '/admin/realisations', count: stats?.projects },
  ];

  return (
    <AdminShell>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
      <p className="text-gray-500 mb-8">
        Bienvenue, {session?.user?.name || session?.user?.email}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{item.count ?? '—'}</span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {item.label}
            </h3>
          </button>
        ))}
      </div>
    </AdminShell>
  );
}

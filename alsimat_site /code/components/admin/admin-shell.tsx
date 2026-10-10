'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Truck,
  FolderTree,
  Wrench,
  Mail,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  Car,
  Tag,
  Sliders,
  FileText,
  Settings,
  FileSignature,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/admin' },
  { icon: Truck, label: 'Véhicules', href: '/admin/vehicules' },
  { icon: FolderTree, label: 'Catégories', href: '/admin/categories' },
  { icon: Car, label: 'Occasion', href: '/admin/occasion' },
  { icon: Tag, label: 'Promotions', href: '/admin/promotions' },
  { icon: Sliders, label: 'Configurateur', href: '/admin/configurateur' },
  { icon: FileSignature, label: 'Demandes de devis', href: '/admin/devis' },
  { icon: Wrench, label: 'Tickets SAV', href: '/admin/sav' },
  { icon: Mail, label: 'Contacts', href: '/admin/contacts' },
  { icon: ImageIcon, label: 'Réalisations', href: '/admin/realisations' },
  { icon: FileText, label: 'Contenu du site', href: '/admin/contenu' },
  { icon: Settings, label: 'Paramètres', href: '/admin/parametres' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-lg shadow-md p-2"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-200 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Admin Alsimat
          </h2>
          <p className="text-sm text-gray-500 mt-1 truncate">{session.user?.email}</p>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-red-600"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      <main className="lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

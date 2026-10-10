"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen, Car, ExternalLink, FolderTree, Gauge, Images, Inbox, LayoutTemplate, LogOut, Menu, Recycle, Settings, Tag, User, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: Gauge },
  { href: "/admin/demandes", label: "Demandes", icon: Inbox, badge: "inbox" },
  { href: "/admin/vehicules", label: "Véhicules", icon: Car },
  { href: "/admin/gammes", label: "Gammes", icon: FolderTree },
  { href: "/admin/occasion", label: "Occasion", icon: Recycle },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/realisations", label: "Réalisations", icon: Images },
  { href: "/admin/conseils", label: "Conseils (blog)", icon: BookOpen },
  { href: "/admin/contenu", label: "Contenu des pages", icon: LayoutTemplate },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
  { href: "/admin/compte", label: "Mon compte", icon: User },
];

export function AdminShell({ children, user, newInquiries, logout }: { children: React.ReactNode; user: string; newInquiries: number; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
          className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active(n.href) ? "bg-brand-500 text-white" : "text-white/70 hover:bg-white/5 hover:text-white")}>
          <n.icon className="h-4 w-4" aria-hidden />
          <span className="flex-1">{n.label}</span>
          {n.badge && newInquiries > 0 && <span className="rounded-full bg-amber-400 px-2 text-xs font-bold text-ink">{newInquiries}</span>}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" aria-hidden /> Voir le site
        </a>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden /> Déconnexion
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-white/40">{user}</p>
      </div>
    </nav>
  );
  return (
    <div className="min-h-svh bg-sand lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink lg:flex">
        <Link href="/admin" className="flex h-16 items-center gap-2 px-6">
          <Image src="/logo-alsimat.png" alt="Alsimat" width={100} height={38} className="h-8 w-auto brightness-0 invert" />
          <span className="text-xs font-semibold text-brand-300">admin</span>
        </Link>
        {nav}
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 lg:hidden">
        <Image src="/logo-alsimat.png" alt="Alsimat" width={90} height={34} className="h-7 w-auto brightness-0 invert" />
        <button type="button" onClick={() => setOpen(!open)} className="text-white" aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </header>
      {open && <div className="fixed inset-x-0 top-14 bottom-0 z-30 flex flex-col overflow-y-auto bg-ink lg:hidden">{nav}</div>}
      <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
    </div>
  );
}

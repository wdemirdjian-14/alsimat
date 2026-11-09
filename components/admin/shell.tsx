"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen, Car, ExternalLink, FolderTree, Gauge, Images, Inbox, LayoutTemplate, ListChecks, LogOut, Mail, Megaphone, Menu, MoreHorizontal, Recycle, Search, Send, Settings, ShieldCheck, Tag, User, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RegisterSW } from "./app-install";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: Gauge },
  { href: "/admin/demandes", label: "Demandes", icon: Inbox, badge: "inbox" },
  { href: "/admin/contacts", label: "Contacts (CRM)", icon: Users },
  { href: "/admin/listes", label: "Listes de diffusion", icon: ListChecks },
  { href: "/admin/emails", label: "E-mails", icon: Send },
  { href: "/admin/campagnes", label: "Campagnes e-mail", icon: Mail },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/marketing", label: "Marketing & SEA", icon: Megaphone },
  { href: "/admin/vehicules", label: "Véhicules", icon: Car },
  { href: "/admin/gammes", label: "Gammes", icon: FolderTree },
  { href: "/admin/occasion", label: "Occasion", icon: Recycle },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/realisations", label: "Réalisations", icon: Images },
  { href: "/admin/conseils", label: "Conseils (blog)", icon: BookOpen },
  { href: "/admin/contenu", label: "Contenu des pages", icon: LayoutTemplate },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
  { href: "/admin/utilisateurs", label: "Administrateurs", icon: ShieldCheck },
  { href: "/admin/compte", label: "Mon compte", icon: User },
];

// Onglets du bas sur mobile : le traitement des demandes et les campagnes à portée de pouce.
const TABS = [
  { href: "/admin", label: "Accueil", icon: Gauge },
  { href: "/admin/demandes", label: "Demandes", icon: Inbox, badge: true },
  { href: "/admin/contacts", label: "Contacts", icon: Users },
  { href: "/admin/campagnes", label: "Campagnes", icon: Mail },
];

export function AdminShell({ children, user, newInquiries, logout }: { children: React.ReactNode; user: string; newInquiries: number; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
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
  const tabActive = TABS.some((t) => active(t.href));
  return (
    <div className="min-h-svh bg-sand lg:pl-64">
      <RegisterSW />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink lg:flex">
        <Link href="/admin" className="flex h-16 items-center gap-2 px-6">
          <Image src="/logo-alsimat.png" alt="Alsimat" width={100} height={38} className="h-8 w-auto brightness-0 invert" />
          <span className="text-xs font-semibold text-brand-300">admin</span>
        </Link>
        {nav}
      </aside>
      <header className="sticky top-0 z-30 bg-ink pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo-alsimat.png" alt="Alsimat" width={90} height={34} className="h-7 w-auto brightness-0 invert" />
            <span className="text-xs font-semibold text-brand-300">admin</span>
          </Link>
          <button type="button" onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center text-white" aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] bottom-0 z-30 flex flex-col overflow-y-auto bg-ink pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden">{nav}</div>
      )}
      <main className="mx-auto max-w-6xl p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:p-8 lg:pb-8">{children}</main>
      <nav aria-label="Navigation rapide" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {TABS.map((t) => {
            const on = !open && active(t.href);
            return (
              <Link key={t.href} href={t.href} onClick={() => setOpen(false)}
                className={cn("relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", on ? "text-brand-300" : "text-white/60")}>
                <t.icon className="h-5 w-5" aria-hidden />
                {t.label}
                {t.badge && newInquiries > 0 && (
                  <span className="absolute top-1.5 left-1/2 ml-1.5 min-w-5 rounded-full bg-amber-400 px-1.5 text-center text-[10px] leading-5 font-bold text-ink">{newInquiries}</span>
                )}
              </Link>
            );
          })}
          <button type="button" onClick={() => setOpen(!open)}
            className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", open || !tabActive ? "text-brand-300" : "text-white/60")}>
            <MoreHorizontal className="h-5 w-5" aria-hidden />
            Plus
          </button>
        </div>
      </nav>
    </div>
  );
}

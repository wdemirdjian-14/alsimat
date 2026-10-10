import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { CompanyInfo } from "@/lib/site";
import { telHref } from "@/lib/site";
import type { NavCategory, NavLink } from "./header";

export function Footer({ company, categories, links }: { company: CompanyInfo; categories: NavCategory[]; links: NavLink[] }) {
  const address = [company.street, [company.postalCode, company.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return (
    <footer className="relative overflow-hidden bg-ink text-white/70">
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Image src="/logo-alsimat.png" alt="Alsimat" width={150} height={56} className="h-12 w-auto brightness-0 invert" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{company.tagline}.</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li>
              <a href={telHref(company.phone)} className="flex items-center gap-3 hover:text-white">
                <Phone className="h-4 w-4 text-brand-300" aria-hidden /> {company.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:text-white">
                <Mail className="h-4 w-4 text-brand-300" aria-hidden /> {company.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden />
              <span>{address || `Intervention : ${company.serviceArea}`}</span>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-3">
          <p className="font-display text-sm font-bold tracking-wide text-white uppercase">Nos gammes</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {categories.flatMap((c) => [c, ...c.children]).map((c) => (
              <li key={c.slug}>
                <Link href={`/gammes/${c.slug}`} className="hover:text-brand-300">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <p className="font-display text-sm font-bold tracking-wide text-white uppercase">Alsimat</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-300">{l.label}</Link>
              </li>
            ))}
            <li><Link href="/sav" className="hover:text-brand-300">Service après-vente</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-3">
          <p className="font-display text-sm font-bold tracking-wide text-white uppercase">Un projet ?</p>
          <p className="mt-5 text-sm leading-relaxed">Décrivez-nous votre usage : nous vous recommandons le modèle adapté et vous envoyons un devis personnalisé.</p>
          <Link href="/contact" className="btn-primary mt-6">Demander un devis</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.legalName}. Tous droits réservés.</p>
          <ul className="flex gap-5">
            <li><Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link></li>
            <li><Link href="/confidentialite" className="hover:text-white">Confidentialité</Link></li>
            <li><Link href="/plan-du-site" className="hover:text-white">Plan du site</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

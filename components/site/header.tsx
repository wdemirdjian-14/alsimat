"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavCategory = { name: string; slug: string; image: string | null; description: string | null; children: { name: string; slug: string }[] };
export type NavLink = { href: string; label: string };

export function Header({ categories, links, phone, phoneHref }: { categories: NavCategory[]; links: NavLink[]; phone: string; phoneHref: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Pages sans bandeau sombre en haut : l'en-tête est toujours opaque.
  // (sauf si la page déclare un bandeau sombre, ex. la vitrine produit avec vidéo)
  const [darkHero, setDarkHero] = useState(false);
  useEffect(() => setDarkHero(!!document.querySelector("[data-dark-hero]")), [pathname]);
  const lightTop = !darkHero && (/^\/(vehicules|occasion|conseils|realisations)\/.+/.test(pathname) || /^\/(mentions-legales|confidentialite|plan-du-site)$/.test(pathname));
  const solid = scrolled || open || lightTop;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid ? "bg-white/95 shadow-[0_1px_0_rgba(13,36,32,0.06)] backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className={cn("hidden border-b transition-colors lg:block", solid ? "border-ink/5 text-ink/60" : "border-white/10 text-white/70")}>
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <p>Conseil · Livraison · SAV sur site</p>
          <a href={phoneHref} className="flex items-center gap-1.5 font-semibold hover:text-brand-400">
            <Phone className="h-3.5 w-3.5" aria-hidden /> {phone}
          </a>
        </div>
      </div>
      <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link href="/" className="relative shrink-0" aria-label="Alsimat – accueil">
          <Image
            src="/logo-alsimat.png"
            alt="Alsimat"
            width={130}
            height={49}
            priority
            className={cn("h-9 w-auto transition lg:h-11", !solid && "brightness-0 invert")}
          />
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className={cn("flex items-center gap-1 text-[15px] font-medium", solid ? "text-ink" : "text-white")}>
            <li className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
              <button
                type="button"
                aria-expanded={mega}
                onClick={() => setMega((m) => !m)}
                className={cn("flex items-center gap-1 rounded-full px-4 py-2 transition hover:bg-current/10", isActive("/gammes") && "text-brand-400")}
              >
                Nos gammes <ChevronDown className={cn("h-4 w-4 transition", mega && "rotate-180")} aria-hidden />
              </button>
              <div
                className={cn(
                  "absolute top-full left-1/2 w-[min(880px,90vw)] -translate-x-1/2 pt-4 transition-all duration-300",
                  mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
                )}
              >
                <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-3xl bg-white p-3 text-ink shadow-2xl shadow-ink/15 ring-1 ring-ink/5">
                  {categories.map((c) => (
                    <div key={c.slug} className="rounded-2xl p-2 transition hover:bg-sand">
                      <Link href={`/gammes/${c.slug}`} className="group flex items-center gap-3">
                        {c.image && (
                          <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl">
                            <Image src={c.image} alt="" fill sizes="80px" className="object-cover transition duration-500 group-hover:scale-110" />
                          </span>
                        )}
                        <span className="font-semibold group-hover:text-brand-600">{c.name}</span>
                      </Link>
                      {c.children.length > 0 && (
                        <ul className="mt-2 space-y-0.5 pl-1 text-sm text-ink-soft">
                          {c.children.map((s) => (
                            <li key={s.slug}>
                              <Link href={`/gammes/${s.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white hover:text-brand-600">
                                <ArrowRight className="h-3 w-3" aria-hidden /> {s.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </li>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn("rounded-full px-4 py-2 transition hover:bg-current/10", isActive(l.href) && "text-brand-400")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/contact" className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">
            Demander un devis
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className={cn("grid h-11 w-11 place-items-center rounded-full lg:hidden", solid ? "text-ink hover:bg-ink/5" : "text-white hover:bg-white/10")}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

    </header>

      {/* Menu mobile (hors du <header> : son flou d'arrière-plan piégerait le positionnement fixe) */}
      <div className={cn("fixed inset-x-0 top-16 bottom-0 z-[45] overflow-y-auto bg-white transition-all duration-300 lg:hidden", open ? "visible opacity-100" : "invisible opacity-0")}>
        <nav aria-label="Navigation mobile" className="container-x py-6">
          <p className="eyebrow">Nos gammes</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {categories.flatMap((c) => [c, ...c.children.map((s) => ({ ...s, image: null, description: null, children: [] }))]).map((c) => (
              <li key={c.slug}>
                <Link href={`/gammes/${c.slug}`} className="block rounded-2xl bg-sand px-4 py-3 text-sm font-semibold text-ink active:bg-brand-50">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 divide-y divide-ink/5 border-y border-ink/5">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center justify-between py-4 text-lg font-semibold text-ink">
                  {l.label} <ArrowRight className="h-5 w-5 text-brand-500" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3">
            <Link href="/contact" className="btn-primary">Demander un devis</Link>
            <a href={phoneHref} className="btn-ghost text-ink">
              <Phone className="h-4 w-4" aria-hidden /> {phone}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}

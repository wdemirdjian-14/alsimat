"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Phone, Menu, X, ChevronDown, Wrench, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavChild {
  label: string;
  href: string;
}
interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];
  flag?: "realisations" | "occasion" | "promotions" | "configurateur";
}

const baseNav: NavLink[] = [
  { label: "Accueil", href: "/" },
  {
    label: "Nos gammes",
    href: "/gammes",
    children: [
      { label: "Tracteurs électriques", href: "/gammes/tracteurs-electriques" },
      { label: "Nacelles tractables", href: "/gammes/nacelles-tractables" },
      { label: "Tricycle électrique", href: "/gammes/tricycle-electrique" },
      { label: "Nacelles sur tracteur agricole", href: "/gammes/nacelles-tracteur-agricole" },
    ],
  },
  { label: "Configurateur", href: "/configurateur", flag: "configurateur" },
  { label: "Occasion", href: "/occasion", flag: "occasion" },
  { label: "Promotions", href: "/promotions", flag: "promotions" },
  { label: "Réalisations", href: "/realisations", flag: "realisations" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact/Devis", href: "/contact" },
];

type Flags = { realisations: boolean; occasion: boolean; promotions: boolean; configurateur: boolean };

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [flags, setFlags] = useState<Flags>({
    realisations: true,
    occasion: true,
    promotions: true,
    configurateur: true,
  });

  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setFlags(data))
      .catch(() => {});
  }, []);

  const navLinks = baseNav.filter((l) => !l.flag || flags[l.flag]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-[#2d3436]/80 backdrop-blur-sm"
      }`}
    >
      {/* Top bar with phone */}
      <div className="bg-[#2d3436] text-white py-1">
        <div className="max-w-[1200px] mx-auto px-4 flex justify-end items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-[#7FBF7F] hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Administration
            </Link>
          )}
          <a
            href="tel:+33620376133"
            className="flex items-center gap-2 text-sm hover:text-[#7FBF7F] transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span suppressHydrationWarning>06 20 37 61 33</span>
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className={`relative h-10 w-[130px] ${scrolled ? "" : "brightness-0 invert"}`}>
              <Image
                src="/brand/alsimat-logo.png"
                alt="Alsimat - tracteurs et nacelles électriques"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center">
            <div className="bg-[#7FBF7F] rounded-full px-4 py-2 flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div key={link.label} className="relative">
                  {link.children ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <button className="flex items-center gap-1 text-white text-sm font-medium px-2.5 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                        {link.label}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl py-2 min-w-[250px] z-50"
                          >
                            {(link.children ?? []).map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#7FBF7F]/10 hover:text-[#7FBF7F] transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-white text-sm font-medium px-2.5 py-1.5 rounded-full hover:bg-white/20 transition-colors whitespace-nowrap"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Right buttons (desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 bg-[#7FBF7F] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6aa96a] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
            <Link
              href="/sav"
              className="flex items-center gap-2 bg-[#2d3436] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#2d3436]/80 transition-colors"
            >
              <Wrench className="w-4 h-4" />
              SAV
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg ${scrolled ? "text-gray-800" : "text-white"}`}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t shadow-xl overflow-hidden"
          >
            <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-1">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#7FBF7F] rounded-lg mb-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Administration
                </Link>
              )}
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <>
                      <div className="px-4 py-2.5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {link.label}
                      </div>
                      {(link.children ?? []).map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-6 py-2.5 text-sm text-gray-700 hover:bg-[#7FBF7F]/10 hover:text-[#7FBF7F] rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-[#7FBF7F]/10 hover:text-[#7FBF7F] rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              <Link
                href="/sav"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2d3436] rounded-lg"
              >
                <Wrench className="w-4 h-4" />
                Demander votre SAV
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

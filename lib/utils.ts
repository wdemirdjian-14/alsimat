import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "9 500 € HT" -> 9500 ; renvoie null si aucun montant. */
export function parsePrice(price?: string | null): number | null {
  if (!price) return null;
  const digits = price.replace(/[^\d,]/g, "").replace(",", ".");
  const n = Number.parseFloat(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Affichage homogène des prix : "9 500 € HT". */
export function formatPrice(price?: string | null) {
  const n = parsePrice(price);
  if (n === null) return price?.trim() || "Prix sur demande";
  const ht = /ttc/i.test(price ?? "") ? "TTC" : "HT";
  return `${new Intl.NumberFormat("fr-FR").format(n)} € ${ht}`;
}

export function firstNumber(value?: string | null): number | null {
  const m = value?.match(/\d+(?:[.,]\d+)?/);
  return m ? Number.parseFloat(m[0].replace(",", ".")) : null;
}

export function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

export function paragraphs(text?: string | null) {
  return (text ?? "")
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const dateFr = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(d);

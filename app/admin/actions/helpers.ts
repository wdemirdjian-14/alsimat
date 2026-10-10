import "server-only";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
export const bool = (fd: FormData, k: string) => fd.get(k) === "on";
export const int = (fd: FormData, k: string) => Number.parseInt(String(fd.get(k) ?? "0"), 10) || 0;
export const jsonList = (fd: FormData, k: string): string[] => {
  try {
    const v = JSON.parse(String(fd.get(k) || "[]"));
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

/** "Clé : valeur" par ligne -> objet */
export const parseSpecs = (text: string | null) =>
  Object.fromEntries(
    (text ?? "")
      .split("\n")
      .map((l) => l.split(/\s*:\s*/))
      .filter(([k, ...v]) => k?.trim() && v.join(":").trim())
      .map(([k, ...v]) => [k.trim(), v.join(":").trim()]),
  );
export const specsToText = (o: unknown) =>
  Object.entries((o as Record<string, string>) ?? {}).map(([k, v]) => `${k} : ${v}`).join("\n");

/** Slug unique pour un modèle Prisma donné. */
export async function uniqueSlug(
  input: string,
  exists: (slug: string) => Promise<{ id: string } | null>,
  currentId?: string,
) {
  const base = slugify(input) || "element";
  let slug = base;
  for (let i = 2; ; i++) {
    const found = await exists(slug);
    if (!found || found.id === currentId) return slug;
    slug = `${base}-${i}`;
  }
}

export const refreshSite = () => revalidatePath("/", "layout");

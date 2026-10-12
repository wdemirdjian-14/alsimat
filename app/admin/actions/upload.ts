"use server";

import { requireAdmin } from "@/lib/auth";
import { savePublicFile, savePublicImage } from "@/lib/uploads";

export async function uploadImages(fd: FormData): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin();
  const hint = String(fd.get("hint") || "");
  const urls: string[] = [];
  for (const f of fd.getAll("files")) {
    if (!(f instanceof File) || !f.size) continue;
    try {
      urls.push(await savePublicImage(f, hint || f.name));
    } catch (e) {
      return { urls, error: e instanceof Error ? e.message : "Échec de l'envoi" };
    }
  }
  return { urls };
}

export async function uploadFile(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const f = fd.get("file");
  if (!(f instanceof File) || !f.size) return { error: "Aucun fichier." };
  try {
    return { url: await savePublicFile(f, String(fd.get("hint") || "") || f.name) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi" };
  }
}

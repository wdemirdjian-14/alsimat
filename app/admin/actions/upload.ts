"use server";

import { requireAdmin } from "@/lib/auth";
import { savePublicImage } from "@/lib/uploads";

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

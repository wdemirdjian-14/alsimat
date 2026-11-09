"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSetting, saveSetting } from "@/lib/settings";
import { int, refreshSite, str } from "./helpers";

/** Enregistre une partie des réglages marketing (chaque formulaire n'envoie que ses champs). */
export async function saveMarketing(back: string, fd: FormData) {
  await requireAdmin();
  const cur = await getSetting("marketing");
  const next = { ...cur };
  for (const k of ["gtm", "ga4", "ads", "adsLabel", "metaPixel", "googleVerification", "bingVerification", "senderName", "replyTo", "postalAddress"] as const)
    if (fd.has(k)) next[k] = (str(fd, k) ?? "").replace(/<meta[^>]*content="([^"]+)"[^>]*>/i, "$1");
  if (fd.has("dailyLimit")) next.dailyLimit = Math.min(5000, Math.max(1, int(fd, "dailyLimit")));
  if (fd.has("perMinute")) next.perMinute = Math.min(100, Math.max(1, int(fd, "perMinute")));
  if (fd.has("indexingForm")) next.indexing = fd.get("indexing") === "on";
  await saveSetting("marketing", next);
  refreshSite();
  redirect(`${back}?ok=1`);
}

const cleanPath = (p: string) => {
  try {
    const u = new URL(p, "https://x.invalid");
    return "/" + u.pathname.replace(/^\/+|\/+$/g, "");
  } catch {
    return "/" + p.replace(/^\/+|\/+$/g, "");
  }
};

export async function addRedirect(fd: FormData) {
  await requireAdmin();
  const from = cleanPath(str(fd, "from") ?? "");
  const rawTo = str(fd, "to") ?? "";
  const to = /^https?:\/\//.test(rawTo) ? rawTo : cleanPath(rawTo);
  if (from === "/" || !rawTo || from === to) redirect("/admin/seo?err=1#redirections");
  await db.redirect.upsert({ where: { from }, update: { to }, create: { from, to } });
  redirect("/admin/seo?ok=1#redirections");
}

export async function deleteRedirect(id: string) {
  await requireAdmin();
  await db.redirect.delete({ where: { id } });
  redirect("/admin/seo?ok=1#redirections");
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signUrl } from "@/lib/email-template";
import { SITE_URL } from "@/lib/site";

/** Lien suivi : enregistre le clic puis redirige (URL signée : pas de redirection ouverte). */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const url = new URL(req.url);
  const target = url.searchParams.get("u") || SITE_URL;
  if (url.searchParams.get("s") !== signUrl(token, target) || !/^https?:\/\//.test(target)) return NextResponse.redirect(SITE_URL);
  const r = await db.campaignRecipient.findUnique({ where: { token }, include: { campaign: true } }).catch(() => null);
  if (r) {
    const now = new Date();
    await db.campaignRecipient.update({ where: { token }, data: { clicks: { increment: 1 }, clickedAt: r.clickedAt ?? now, openedAt: r.openedAt ?? now } });
  }
  // Attribution : les demandes issues de la campagne sont reconnues dans le CRM.
  const dest = new URL(target);
  if (r && dest.origin === new URL(SITE_URL).origin && !dest.searchParams.has("utm_source")) {
    dest.searchParams.set("utm_source", "emailing");
    dest.searchParams.set("utm_medium", "email");
    dest.searchParams.set("utm_campaign", r.campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50));
  }
  return NextResponse.redirect(dest.toString());
}

"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { materializeRecipients } from "@/lib/campaign-sender";
import { hasAudience, type Audience } from "@/lib/crm";
import { db } from "@/lib/db";
import { merge, renderEmail } from "@/lib/email-template";
import { sendRichMail } from "@/lib/mail";
import { getSetting } from "@/lib/settings";
import { str } from "./helpers";

const list = (fd: FormData, k: string) => fd.getAll(k).map(String).filter(Boolean);
const tagList = (v: string | null) => (v ?? "").split(/[,;]/).map((t) => t.trim().toLowerCase()).filter(Boolean);

export async function saveCampaign(id: string | null, fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name"), subject = str(fd, "subject"), body = str(fd, "body");
  if (!name || !subject || !body) throw new Error("Nom, objet et message sont obligatoires.");
  const data = {
    name, subject, body, preheader: str(fd, "preheader"), ctaLabel: str(fd, "ctaLabel"), ctaUrl: str(fd, "ctaUrl"), image: str(fd, "image"),
    audience: {
      lists: list(fd, "lists"), segments: list(fd, "segments"), statuses: list(fd, "statuses"), tags: tagList(str(fd, "tags")), excludeTags: tagList(str(fd, "excludeTags")),
      categories: list(fd, "categories"), regions: list(fd, "regions"),
      departments: (str(fd, "departments") ?? "").split(/[\s,;]+/).map((d) => d.trim().toUpperCase().padStart(2, "0")).filter((d) => /^(\d{2,3}|2A|2B)$/.test(d)),
      stars: list(fd, "stars").map(Number).filter((n) => n >= 1 && n <= 5),
    },
  };
  if (id) {
    const c = await db.campaign.findUniqueOrThrow({ where: { id } });
    if (!["brouillon", "pause"].includes(c.status) && c.status !== "programmee") throw new Error("Une campagne envoyée ne peut plus être modifiée.");
  }
  const saved = id ? await db.campaign.update({ where: { id }, data }) : await db.campaign.create({ data });
  redirect(`/admin/campagnes/${saved.id}?ok=1`);
}

export async function sendTest(id: string, _prev: string | null, fd: FormData): Promise<string | null> {
  const admin = await requireAdmin();
  const to = str(fd, "testEmail") || admin.email;
  const c = await db.campaign.findUniqueOrThrow({ where: { id } });
  const m = await getSetting("marketing");
  const { html, text } = renderEmail({
    subject: c.subject, preheader: c.preheader, body: c.body, image: c.image, ctaLabel: c.ctaLabel, ctaUrl: c.ctaUrl,
    merge: { prenom: "Jean", nom: "Dupont", societe: "Camping des Pins", ville: "Orléans" }, senderName: m.senderName, postalAddress: m.postalAddress, unsubscribe: "#",
  });
  try {
    await sendRichMail({ to, subject: `[TEST] ${merge(c.subject, { prenom: "Jean", nom: "Dupont", societe: "Camping des Pins", ville: "Orléans" })}`, html, text, fromName: m.senderName, replyTo: m.replyTo, marketing: true });
    return `ok:${to}`;
  } catch (e) {
    return e instanceof Error ? e.message : "Échec de l'envoi.";
  }
}

export async function launchCampaign(id: string, fd: FormData) {
  await requireAdmin();
  const c = await db.campaign.findUniqueOrThrow({ where: { id } });
  if (!["brouillon", "pause", "programmee"].includes(c.status)) redirect(`/admin/campagnes/${id}`);
  // Garde-fou : jamais d'envoi à « tous les contacts » par erreur.
  if (!hasAudience((c.audience ?? {}) as Audience)) redirect(`/admin/campagnes/${id}?err=audience`);
  const when = str(fd, "scheduledAt");
  if (when) {
    await db.campaign.update({ where: { id }, data: { status: "programmee", scheduledAt: new Date(when) } });
  } else {
    await materializeRecipients(id);
    await db.campaign.update({ where: { id }, data: { status: "envoi", startedAt: c.startedAt ?? new Date(), scheduledAt: null } });
  }
  redirect(`/admin/campagnes/${id}?ok=1`);
}

export async function pauseCampaign(id: string) {
  await requireAdmin();
  await db.campaign.update({ where: { id }, data: { status: "pause" } });
  redirect(`/admin/campagnes/${id}`);
}

export async function duplicateCampaign(id: string) {
  await requireAdmin();
  const c = await db.campaign.findUniqueOrThrow({ where: { id } });
  const copy = await db.campaign.create({
    data: { name: `${c.name} (copie)`, subject: c.subject, preheader: c.preheader, body: c.body, ctaLabel: c.ctaLabel, ctaUrl: c.ctaUrl, image: c.image, audience: c.audience ?? {} },
  });
  redirect(`/admin/campagnes/${copy.id}`);
}

export async function deleteCampaign(id: string) {
  await requireAdmin();
  await db.campaign.delete({ where: { id } });
  redirect("/admin/campagnes?ok=1");
}

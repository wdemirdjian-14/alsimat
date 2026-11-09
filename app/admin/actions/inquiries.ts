"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { renderEmail, merge } from "@/lib/email-template";
import { sendRichMail } from "@/lib/mail";
import { getSetting } from "@/lib/settings";
import { INQUIRY_STATUS } from "@/lib/inquiry-labels";

/** Changement de statut en un geste (boutons rapides sur mobile). */
export async function setInquiryStatus(id: string, status: string) {
  await requireAdmin();
  if (!INQUIRY_STATUS[status]) return;
  await db.inquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
}

/** Réponse par e-mail à l'auteur d'une demande, tracée dans l'historique CRM. */
export async function replyToInquiry(id: string, _prev: string | null, fd: FormData): Promise<string | null> {
  const admin = await requireAdmin();
  const q = await db.inquiry.findUniqueOrThrow({ where: { id } });
  const subject = String(fd.get("subject") ?? "").trim();
  const body = String(fd.get("body") ?? "").trim();
  if (!subject || !body) return "Objet et message requis.";
  const m = await getSetting("marketing");
  const vars = { prenom: q.firstName, nom: q.lastName, societe: q.company, ville: null };
  const { html, text } = renderEmail({ subject, body, merge: vars, senderName: m.senderName, postalAddress: m.postalAddress });
  try {
    await sendRichMail({ to: q.email, subject: merge(subject, vars), html, text, fromName: m.senderName, replyTo: m.replyTo || admin.email });
  } catch (e) {
    return e instanceof Error ? e.message : "Échec de l'envoi.";
  }
  const stamp = `[${new Date().toLocaleString("fr-FR")}] Réponse envoyée par ${admin.email} : ${subject}`;
  await db.inquiry.update({
    where: { id },
    data: { status: fd.get("close") ? "traite" : q.status === "nouveau" ? "en_cours" : q.status, notes: q.notes ? `${q.notes}\n${stamp}` : stamp },
  });
  if (q.contactId) {
    await db.activity.create({ data: { contactId: q.contactId, type: "email", title: `E-mail : ${subject}`, content: body, author: admin.email } });
    await db.contact.update({ where: { id: q.contactId }, data: { lastContactAt: new Date() } });
  }
  revalidatePath("/admin", "layout");
  return "ok";
}

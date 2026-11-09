import "server-only";
import { unlink } from "node:fs/promises";
import { db } from "./db";
import { merge, renderEmail } from "./email-template";
import { sendRichMail } from "./mail";
import { getSetting } from "./settings";
import { attachmentLabel, privatePath, saveAttachments } from "./uploads";

/** Retrouve le contact CRM d'une adresse, ou le crée (pour que tout échange apparaisse dans la vue 360). */
export async function contactForEmail(email: string, extra: { firstName?: string | null; lastName?: string | null; company?: string | null } = {}) {
  const e = email.trim().toLowerCase();
  return (
    (await db.contact.findUnique({ where: { email: e } })) ??
    (await db.contact.create({
      data: { email: e, firstName: extra.firstName ?? null, lastName: extra.lastName ?? null, company: extra.company ?? null, source: "E-mail direct", consent: "b2b", status: "a_contacter", lastContactAt: new Date() },
    }))
  );
}

const files = (fd: FormData) => fd.getAll("files").filter((f): f is File => typeof f === "object" && f !== null && "size" in f);

/**
 * E-mail individuel (hors campagne) : mise en forme Alsimat, pièces jointes, copie éventuelle,
 * puis inscription dans l'historique du contact (et de la demande le cas échéant).
 */
export async function sendDirectEmail(o: { fd: FormData; author: string; contactId: string; inquiryId?: string }): Promise<string | null> {
  const subject = String(o.fd.get("subject") ?? "").trim();
  const body = String(o.fd.get("body") ?? "").trim();
  const cc = String(o.fd.get("cc") ?? "").trim();
  if (!subject || !body) return "Objet et message requis.";
  if (cc && !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(cc)) return "Adresse en copie invalide.";
  const c = await db.contact.findUniqueOrThrow({ where: { id: o.contactId } });
  if (c.bounced) return "Adresse marquée invalide : envoi impossible.";
  let attachments: string[];
  try {
    attachments = await saveAttachments(files(o.fd));
  } catch (e) {
    return e instanceof Error ? e.message : "Pièces jointes refusées.";
  }
  const m = await getSetting("marketing");
  const vars = { prenom: c.firstName, nom: c.lastName, societe: c.company, ville: c.city };
  const { html, text } = renderEmail({ subject, body, merge: vars, senderName: m.senderName, postalAddress: m.postalAddress });
  try {
    await sendRichMail({
      to: c.email, cc, subject: merge(subject, vars), html, text, fromName: m.senderName, replyTo: m.replyTo || o.author,
      attachments: attachments.map((p) => ({ filename: attachmentLabel(p), path: privatePath(p)! })),
    });
  } catch (e) {
    await Promise.all(attachments.map((p) => unlink(privatePath(p)!).catch(() => {})));
    return e instanceof Error ? e.message : "Échec de l'envoi.";
  }
  await db.activity.create({
    data: {
      contactId: c.id, inquiryId: o.inquiryId ?? null, type: "email", author: o.author, attachments,
      title: `E-mail envoyé : ${merge(subject, vars)}`, content: (cc ? `Copie : ${cc}\n\n` : "") + merge(body, vars),
    },
  });
  await db.contact.update({ where: { id: c.id }, data: { lastContactAt: new Date() } });
  return "ok";
}

/** Note interne (avec pièces jointes) rattachée à un contact et éventuellement à une demande. */
export async function addInternalNote(o: { fd: FormData; author: string; contactId: string; inquiryId?: string }): Promise<string | null> {
  const content = String(o.fd.get("content") ?? "").trim();
  const type = String(o.fd.get("type") ?? "note");
  let attachments: string[];
  try {
    attachments = await saveAttachments(files(o.fd));
  } catch (e) {
    return e instanceof Error ? e.message : "Pièces jointes refusées.";
  }
  if (!content && !attachments.length) return "Écrivez une note ou joignez un fichier.";
  const titles: Record<string, string> = { note: "Note interne", appel: "Appel téléphonique", rdv: "Rendez-vous", devis: "Devis envoyé" };
  await db.activity.create({
    data: { contactId: o.contactId, inquiryId: o.inquiryId ?? null, type: titles[type] ? type : "note", title: titles[type] ?? "Note interne", content: content || null, attachments, author: o.author },
  });
  if (type !== "note") await db.contact.update({ where: { id: o.contactId }, data: { lastContactAt: new Date() } });
  return "ok";
}

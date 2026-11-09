"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { mapColumns, normEmail, parseCsv, STATUS } from "@/lib/crm";
import { db } from "@/lib/db";
import { merge, renderEmail } from "@/lib/email-template";
import { sendRichMail } from "@/lib/mail";
import { getSetting } from "@/lib/settings";
import { int, str } from "./helpers";

const tagsOf = (v: string | null) => [...new Set((v ?? "").split(/[,;]/).map((t) => t.trim().toLowerCase()).filter(Boolean))];
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export async function saveContact(id: string | null, fd: FormData) {
  const admin = await requireAdmin();
  const email = normEmail(str(fd, "email") ?? "");
  if (!isEmail(email)) throw new Error("E-mail invalide.");
  const data = {
    email, firstName: str(fd, "firstName"), lastName: str(fd, "lastName"), company: str(fd, "company"), jobTitle: str(fd, "jobTitle"),
    phone: str(fd, "phone"), city: str(fd, "city"), postalCode: str(fd, "postalCode"), segment: str(fd, "segment") ?? "prospect",
    status: str(fd, "status") ?? "nouveau", tags: tagsOf(str(fd, "tags")), source: str(fd, "source"), consent: str(fd, "consent") ?? "b2b",
    originNote: str(fd, "originNote"), notes: str(fd, "notes"), estimatedValue: str(fd, "estimatedValue") ? int(fd, "estimatedValue") : null,
    unsubscribed: fd.get("unsubscribed") === "on",
  };
  const before = id ? await db.contact.findUnique({ where: { id } }) : null;
  const saved = id ? await db.contact.update({ where: { id }, data }) : await db.contact.create({ data: { ...data, source: data.source ?? "Saisie manuelle" } });
  if (before && before.status !== saved.status)
    await db.activity.create({ data: { contactId: saved.id, type: "statut", title: `Statut : ${STATUS[before.status]?.label ?? before.status} → ${STATUS[saved.status]?.label ?? saved.status}`, author: admin.email } });
  redirect(`/admin/contacts/${saved.id}?ok=1`);
}

export async function deleteContact(id: string) {
  await requireAdmin();
  await db.contact.delete({ where: { id } });
  redirect("/admin/contacts?ok=1");
}

export async function setStatus(id: string, status: string) {
  const admin = await requireAdmin();
  const before = await db.contact.findUniqueOrThrow({ where: { id } });
  if (before.status === status) return;
  await db.contact.update({ where: { id }, data: { status } });
  await db.activity.create({ data: { contactId: id, type: "statut", title: `Statut : ${STATUS[before.status]?.label} → ${STATUS[status]?.label}`, author: admin.email } });
  revalidatePath("/admin/contacts");
}

export async function addActivity(contactId: string, fd: FormData) {
  const admin = await requireAdmin();
  const type = str(fd, "type") ?? "note";
  const content = str(fd, "content");
  if (!content) return;
  const titles: Record<string, string> = { note: "Note", appel: "Appel téléphonique", rdv: "Rendez-vous", devis: "Devis envoyé" };
  await db.activity.create({ data: { contactId, type, title: str(fd, "title") || titles[type] || "Note", content, author: admin.email } });
  if (type !== "note") await db.contact.update({ where: { id: contactId }, data: { lastContactAt: new Date() } });
  redirect(`/admin/contacts/${contactId}#historique`);
}

export async function sendContactEmail(contactId: string, _prev: string | null, fd: FormData): Promise<string | null> {
  const admin = await requireAdmin();
  const c = await db.contact.findUniqueOrThrow({ where: { id: contactId } });
  const subject = str(fd, "subject"), body = str(fd, "body");
  if (!subject || !body) return "Objet et message requis.";
  const m = await getSetting("marketing");
  const { html, text } = renderEmail({ subject, body, merge: { prenom: c.firstName, nom: c.lastName, societe: c.company, ville: c.city }, senderName: m.senderName, postalAddress: m.postalAddress });
  try {
    await sendRichMail({ to: c.email, subject: merge(subject, { prenom: c.firstName, nom: c.lastName, societe: c.company, ville: c.city }), html, text, fromName: m.senderName, replyTo: m.replyTo || admin.email });
  } catch (e) {
    return e instanceof Error ? e.message : "Échec de l'envoi.";
  }
  await db.activity.create({ data: { contactId, type: "email", title: `E-mail : ${subject}`, content: body, author: admin.email } });
  await db.contact.update({ where: { id: contactId }, data: { lastContactAt: new Date() } });
  revalidatePath(`/admin/contacts/${contactId}`);
  return "ok";
}

export async function bulkAction(fd: FormData) {
  await requireAdmin();
  const ids = fd.getAll("ids").map(String);
  const action = str(fd, "action");
  const value = str(fd, "value");
  const back = str(fd, "back") || "/admin/contacts";
  if (!ids.length || !action) redirect(back);
  if (action === "delete") await db.contact.deleteMany({ where: { id: { in: ids } } });
  if (action === "status" && value) await db.contact.updateMany({ where: { id: { in: ids } }, data: { status: value } });
  if (action === "segment" && value) await db.contact.updateMany({ where: { id: { in: ids } }, data: { segment: value } });
  if ((action === "tag" || action === "untag") && value) {
    const tag = value.trim().toLowerCase();
    for (const c of await db.contact.findMany({ where: { id: { in: ids } }, select: { id: true, tags: true } }))
      await db.contact.update({ where: { id: c.id }, data: { tags: action === "tag" ? [...new Set([...c.tags, tag])] : c.tags.filter((t) => t !== tag) } });
  }
  redirect(back + (back.includes("?") ? "&" : "?") + "ok=1");
}

export type ImportReport = { ok: boolean; message: string; created?: number; updated?: number; skipped?: number; invalid?: string[] } | null;

export async function importContacts(_prev: ImportReport, fd: FormData): Promise<ImportReport> {
  await requireAdmin();
  if (fd.get("certify") !== "on") return { ok: false, message: "Merci de certifier l'origine licite du fichier." };
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, message: "Aucun fichier." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, message: "Fichier trop lourd (10 Mo max)." };
  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { ok: false, message: "Le fichier est vide ou n'a pas de ligne d'en-tête." };
  const cols = mapColumns(rows[0]);
  if (!cols.includes("email")) return { ok: false, message: `Colonne « e-mail » introuvable. En-têtes lus : ${rows[0].join(" | ")}` };

  const extraTags = tagsOf(str(fd, "tags"));
  const segment = str(fd, "segment") ?? "prospect";
  const consent = str(fd, "consent") ?? "b2b";
  const source = str(fd, "source") ?? `Import ${file.name}`;
  const originNote = str(fd, "originNote");
  const overwrite = fd.get("overwrite") === "on";
  let created = 0, updated = 0, skipped = 0;
  const invalid: string[] = [];

  for (const r of rows.slice(1)) {
    const rec: Record<string, string> = {};
    cols.forEach((k, i) => { if (k && r[i]?.trim()) rec[k] = r[i].trim(); });
    const email = normEmail(rec.email ?? "");
    if (!isEmail(email)) { if (rec.email) invalid.push(rec.email); skipped++; continue; }
    const tags = [...new Set([...tagsOf(rec.tags ?? ""), ...extraTags])];
    const fields = { firstName: rec.firstName, lastName: rec.lastName, company: rec.company, jobTitle: rec.jobTitle, phone: rec.phone, city: rec.city, postalCode: rec.postalCode, notes: rec.notes };
    const existing = await db.contact.findUnique({ where: { email } });
    if (existing) {
      // Jamais de réabonnement automatique d'un contact désinscrit.
      const patch = Object.fromEntries(Object.entries(fields).filter(([k, v]) => v && (overwrite || !existing[k as keyof typeof existing])));
      await db.contact.update({ where: { id: existing.id }, data: { ...patch, tags: [...new Set([...existing.tags, ...tags])] } });
      updated++;
    } else {
      await db.contact.create({ data: { email, ...fields, tags, segment, consent, source, originNote } });
      created++;
    }
  }
  return { ok: true, message: "Import terminé.", created, updated, skipped, invalid: invalid.slice(0, 20) };
}

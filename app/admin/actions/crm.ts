"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { mapColumns, normEmail, readSpreadsheet, slugTag, STATUS } from "@/lib/crm";
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
    website: str(fd, "website"),
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
  if (action === "list" && value) {
    const list = await db.contactList.upsert({ where: { name: value }, update: {}, create: { name: value } });
    await db.listMember.createMany({ data: ids.map((contactId) => ({ listId: list.id, contactId })), skipDuplicates: true });
  }
  if (action === "unlist" && value) {
    const list = await db.contactList.findUnique({ where: { name: value } });
    if (list) await db.listMember.deleteMany({ where: { listId: list.id, contactId: { in: ids } } });
  }
  if (action === "status" && value) await db.contact.updateMany({ where: { id: { in: ids } }, data: { status: value } });
  if (action === "segment" && value) await db.contact.updateMany({ where: { id: { in: ids } }, data: { segment: value } });
  if ((action === "tag" || action === "untag") && value) {
    const tag = value.trim().toLowerCase();
    for (const c of await db.contact.findMany({ where: { id: { in: ids } }, select: { id: true, tags: true } }))
      await db.contact.update({ where: { id: c.id }, data: { tags: action === "tag" ? [...new Set([...c.tags, tag])] : c.tags.filter((t) => t !== tag) } });
  }
  redirect(back + (back.includes("?") ? "&" : "?") + "ok=1");
}

export type ImportReport = { ok: boolean; message: string; created?: number; updated?: number; skipped?: number; invalid?: string[]; lists?: string[] } | null;

const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

/**
 * Import CSV / Excel. Colonnes reconnues : e-mail, prénom, nom, société, fonction, téléphone, code postal,
 * ville, site web, département, région, catégorie/type/étiquettes, liste(s), segment, source, origine, notes.
 * Rapide (traitement par lots) : plusieurs dizaines de milliers de lignes en quelques secondes.
 */
export async function importContacts(_prev: ImportReport, fd: FormData): Promise<ImportReport> {
  await requireAdmin();
  if (fd.get("certify") !== "on") return { ok: false, message: "Merci de certifier l'origine licite du fichier." };
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, message: "Aucun fichier." };
  if (file.size > 20 * 1024 * 1024) return { ok: false, message: "Fichier trop lourd (20 Mo max). Découpez-le en plusieurs fichiers." };
  let rows: string[][];
  try {
    rows = await readSpreadsheet(file);
  } catch {
    return { ok: false, message: "Fichier illisible. Formats acceptés : CSV (UTF-8) ou Excel .xlsx." };
  }
  if (rows.length < 2) return { ok: false, message: "Le fichier est vide ou n'a pas de ligne d'en-tête." };
  const cols = mapColumns(rows[0]);
  if (!cols.includes("email")) return { ok: false, message: `Colonne « e-mail » introuvable. En-têtes lus : ${rows[0].join(" | ")}` };

  const extraTags = tagsOf(str(fd, "tags"));
  const segment = str(fd, "segment") ?? "prospect";
  const consent = str(fd, "consent") ?? "b2b";
  const source = str(fd, "source") ?? `Import ${file.name}`;
  const originNote = str(fd, "originNote");
  const overwrite = fd.get("overwrite") === "on";

  // Listes : liste choisie / nouvelle liste du formulaire + colonne « Liste » du fichier.
  const listCache = new Map<string, string>();
  const listId = async (name: string) => {
    const n = name.trim().replace(/\s+/g, " ").slice(0, 80);
    if (!n) return null;
    const key = n.toLowerCase();
    if (!listCache.has(key)) {
      const l = await db.contactList.upsert({ where: { name: n }, update: {}, create: { name: n } });
      listCache.set(key, l.id);
    }
    return listCache.get(key)!;
  };
  const formLists: string[] = [];
  for (const id of fd.getAll("listIds").map(String).filter(Boolean)) formLists.push(id);
  const newList = str(fd, "newList");
  if (newList) formLists.push((await listId(newList))!);

  type Rec = { data: Record<string, string | undefined>; tags: Set<string>; lists: Set<string> };
  const byEmail = new Map<string, Rec>();
  const invalid: string[] = [];
  let skipped = 0;
  for (const r of rows.slice(1)) {
    const rec: Record<string, string> = {};
    cols.forEach((k, i) => { if (k && r[i]?.trim()) rec[k] = r[i].trim(); });
    const email = normEmail((rec.email ?? "").split(/[;,\s]+/)[0] ?? "");
    if (!isEmail(email)) { if (rec.email) invalid.push(rec.email); skipped++; continue; }
    const cur = byEmail.get(email) ?? { data: {}, tags: new Set(extraTags), lists: new Set(formLists) };
    for (const k of ["firstName", "lastName", "company", "jobTitle", "phone", "city", "postalCode", "website", "notes", "source", "originNote", "segment"])
      if (rec[k] && !cur.data[k]) cur.data[k] = rec[k];
    tagsOf(rec.tags ?? "").forEach((t) => cur.tags.add(slugTag(t)));
    if (rec.department) cur.tags.add(`dep-${slugTag(rec.department)}`);
    if (rec.region) cur.tags.add(`region-${slugTag(rec.region)}`);
    for (const ln of (rec.lists ?? "").split(/[|;,]/)) { const id = await listId(ln); if (id) cur.lists.add(id); }
    byEmail.set(email, cur);
  }

  const emails = [...byEmail.keys()];
  const existing = new Map<string, { id: string; tags: string[] } & Record<string, unknown>>();
  for (const part of chunk(emails, 1000))
    for (const c of await db.contact.findMany({ where: { email: { in: part } } })) existing.set(c.email, c);

  const SEGMENTS_OK = ["prospect", "client", "partenaire"];
  const toCreate = emails.filter((e) => !existing.has(e)).map((email) => {
    const { data, tags } = byEmail.get(email)!;
    return {
      email, firstName: data.firstName, lastName: data.lastName, company: data.company, jobTitle: data.jobTitle, phone: data.phone,
      city: data.city, postalCode: data.postalCode, website: data.website, notes: data.notes,
      segment: SEGMENTS_OK.includes((data.segment ?? "").toLowerCase()) ? data.segment!.toLowerCase() : segment,
      consent, source: data.source ?? source, originNote: data.originNote ?? originNote, tags: [...tags],
    };
  });
  for (const part of chunk(toCreate, 1000)) await db.contact.createMany({ data: part, skipDuplicates: true });

  let updated = 0;
  for (const [email, c] of existing) {
    const { data, tags } = byEmail.get(email)!;
    // Jamais de réabonnement automatique d'un contact désinscrit.
    const patch = Object.fromEntries(
      ["firstName", "lastName", "company", "jobTitle", "phone", "city", "postalCode", "website", "notes"]
        .filter((k) => data[k] && (overwrite || !c[k]))
        .map((k) => [k, data[k]]),
    );
    await db.contact.update({ where: { id: c.id }, data: { ...patch, tags: [...new Set([...c.tags, ...tags])] } });
    updated++;
  }

  const ids = new Map<string, string>();
  for (const part of chunk(emails, 1000))
    for (const c of await db.contact.findMany({ where: { email: { in: part } }, select: { id: true, email: true } })) ids.set(c.email, c.id);
  const members = emails.flatMap((e) => [...byEmail.get(e)!.lists].map((listId) => ({ listId, contactId: ids.get(e)! }))).filter((m) => m.contactId);
  for (const part of chunk(members, 2000)) await db.listMember.createMany({ data: part, skipDuplicates: true });

  const listNames = (await db.contactList.findMany({ where: { id: { in: [...new Set(members.map((m) => m.listId))] } }, select: { name: true } })).map((l) => l.name);
  revalidatePath("/admin/contacts");
  return { ok: true, message: "Import terminé.", created: toCreate.length, updated, skipped, invalid: invalid.slice(0, 20), lists: listNames };
}

// ---------- Listes de diffusion ----------

export async function saveList(id: string | null, fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) throw new Error("Nom requis.");
  const data = { name, description: str(fd, "description"), color: str(fd, "color") ?? "#46a584" };
  if (id) await db.contactList.update({ where: { id }, data });
  else await db.contactList.create({ data });
  redirect("/admin/listes?ok=1");
}

export async function deleteList(id: string) {
  await requireAdmin();
  await db.contactList.delete({ where: { id } });
  redirect("/admin/listes?ok=1");
}

export async function setContactLists(contactId: string, fd: FormData) {
  await requireAdmin();
  const listIds = fd.getAll("listIds").map(String);
  await db.listMember.deleteMany({ where: { contactId, listId: { notIn: listIds } } });
  await db.listMember.createMany({ data: listIds.map((listId) => ({ listId, contactId })), skipDuplicates: true });
  redirect(`/admin/contacts/${contactId}?ok=1`);
}

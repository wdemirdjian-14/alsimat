import type { Prisma } from "@prisma/client";
import { db } from "./db";

type Tone = "neutral" | "green" | "amber" | "red" | "blue";

/** Étapes du pipeline commercial (ordre = colonnes du pipeline). */
export const STATUSES: { key: string; label: string; tone: Tone }[] = [
  { key: "nouveau", label: "Nouveau", tone: "blue" },
  { key: "a_contacter", label: "À contacter", tone: "amber" },
  { key: "en_discussion", label: "En discussion", tone: "blue" },
  { key: "devis_envoye", label: "Devis envoyé", tone: "amber" },
  { key: "gagne", label: "Gagné", tone: "green" },
  { key: "perdu", label: "Perdu", tone: "red" },
];
export const STATUS = Object.fromEntries(STATUSES.map((s) => [s.key, s]));

export const SEGMENTS = [
  { key: "prospect", label: "Prospect" },
  { key: "client", label: "Client" },
  { key: "partenaire", label: "Partenaire" },
];
export const CONSENTS = [
  { key: "b2b", label: "Professionnel (intérêt légitime B2B)" },
  { key: "optin", label: "Accord explicite (opt-in)" },
  { key: "client", label: "Client existant" },
];

export const normEmail = (e: string) => e.trim().toLowerCase();

/** Crée ou complète le contact correspondant à une demande du site, et l'historise. */
export async function syncInquiryToContact(inquiryId: string) {
  const q = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!q) return;
  const email = normEmail(q.email);
  const existing = await db.contact.findUnique({ where: { email } });
  const label = q.type === "sav" ? "Demande SAV" : q.type === "devis" ? "Demande de devis" : "Message";
  const contact = existing
    ? await db.contact.update({
        where: { id: existing.id },
        data: {
          firstName: existing.firstName || q.firstName,
          lastName: existing.lastName || q.lastName,
          company: existing.company || q.company,
          phone: existing.phone || q.phone,
          postalCode: existing.postalCode || q.postalCode,
          lastContactAt: new Date(),
          // Une nouvelle demande d'un contact « perdu » ou « nouveau » le remet dans la boucle.
          ...(["perdu", "nouveau"].includes(existing.status) ? { status: "a_contacter" } : {}),
        },
      })
    : await db.contact.create({
        data: {
          email, firstName: q.firstName, lastName: q.lastName, company: q.company, phone: q.phone, postalCode: q.postalCode,
          source: q.source ?? "Site web", status: "a_contacter", consent: "optin", lastContactAt: new Date(),
          tags: [q.type === "sav" ? "sav" : "site-web"],
        },
      });
  await db.inquiry.update({ where: { id: q.id }, data: { contactId: contact.id } });
  await db.activity.create({
    data: {
      contactId: contact.id, type: "demande",
      title: `${label}${q.vehicleRef ? ` – ${q.vehicleRef}` : ""}`,
      content: [q.subject, q.message, q.serialNumber && `N° de série : ${q.serialNumber}`, q.source && `Provenance : ${q.source}`].filter(Boolean).join("\n\n"),
    },
  });
}

export type Audience = {
  lists?: string[]; segments?: string[]; statuses?: string[]; tags?: string[]; excludeTags?: string[];
  categories?: string[]; regions?: string[]; departments?: string[]; stars?: number[];
};

/** Une audience doit cibler explicitement quelque chose : jamais « tous les contacts » par défaut. */
export const hasAudience = (a: Audience) =>
  !!(a.lists?.length || a.segments?.length || a.statuses?.length || a.tags?.length || a.categories?.length || a.regions?.length || a.departments?.length);

/** Filtre Prisma des destinataires d'une campagne (toujours sans désinscrits ni adresses invalides). */
export function audienceWhere(a: Audience): Prisma.ContactWhereInput {
  return {
    unsubscribed: false,
    bounced: false,
    ...(a.lists?.length ? { lists: { some: { listId: { in: a.lists } } } } : {}),
    ...(a.segments?.length ? { segment: { in: a.segments } } : {}),
    ...(a.statuses?.length ? { status: { in: a.statuses } } : {}),
    ...(a.tags?.length ? { tags: { hasSome: a.tags } } : {}),
    ...(a.excludeTags?.length ? { NOT: { tags: { hasSome: a.excludeTags } } } : {}),
    ...(a.categories?.length ? { category: { in: a.categories } } : {}),
    ...(a.regions?.length ? { region: { in: a.regions } } : {}),
    ...(a.departments?.length ? { department: { in: a.departments } } : {}),
    ...(a.stars?.length ? { stars: { in: a.stars } } : {}),
  };
}

/** Lecture CSV tolérante (séparateur ; ou , ; guillemets ; BOM). */
export function parseCsv(text: string): string[][] {
  const t = text.replace(/^﻿/, "");
  const first = t.split(/\r?\n/)[0] ?? "";
  const sep = (first.match(/;/g)?.length ?? 0) >= (first.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

/** Reconnaissance automatique des colonnes d'un fichier de prospects (insensible aux accents et à la casse). */
const COLUMN_ALIASES: Record<string, RegExp> = {
  email: /^(e-?mail|courriel|mail|adresse e-?mail|adresse mail|e-?mail trouve|e-?mail (pro|professionnel|de contact|contact)|email address)$/,
  firstName: /^(prenom|first ?name)$/,
  lastName: /^(nom|last ?name|nom de famille)$/,
  company: /^(societe|entreprise|raison sociale|company|organisation|etablissement|nom de l'etablissement|nom etablissement)$/,
  jobTitle: /^(fonction|poste|titre|job ?title)$/,
  phone: /^(telephone|tel|mobile|portable|phone)$/,
  city: /^(ville|commune|city)$/,
  postalCode: /^(code postal|cp|postal ?code|zip)$/,
  category: /^(categories?|type|type d'etablissement|secteur|activite)$/,
  classement: /^(classement|etoiles|nombre d'etoiles)$/,
  tags: /^(tags?|etiquettes?)$/,
  lists: /^(listes?|listes? de diffusion|fichier)$/,
  segment: /^(segment)$/,
  website: /^(site|site web|site internet|website|url)$/,
  department: /^(departement|dept|dep)$/,
  region: /^(region)$/,
  source: /^(source|provenance)$/,
  originNote: /^(origine|origine des donnees|page source)$/,
  notes: /^(notes?|commentaires?|remarques?)$/,
};
const normHeader = (h: string) => h.replace(/[’`]/g, "'").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export function mapColumns(header: string[]) {
  const cols = header.map((h) => Object.entries(COLUMN_ALIASES).find(([, re]) => re.test(normHeader(String(h ?? ""))))?.[0] ?? null);
  // Fichier d'établissements : une colonne « Nom » sans « Prénom » ni « Société » désigne l'établissement.
  if (!cols.includes("firstName") && !cols.includes("company")) {
    const i = cols.indexOf("lastName");
    if (i >= 0) cols[i] = "company";
  }
  return cols;
}

export const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Lit un fichier CSV ou Excel (.xlsx, 1re feuille) en tableau de lignes. */
export async function readSpreadsheet(file: File): Promise<string[][]> {
  return (await readSpreadsheetInfo(file)).rows;
}

/** Comme readSpreadsheet, en indiquant l'onglet retenu : le premier qui contient une colonne e-mail. */
export async function readSpreadsheetInfo(file: File): Promise<{ rows: string[][]; sheet?: string }> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || file.type.includes("spreadsheetml")) {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(Buffer.from(await file.arrayBuffer()) as unknown as ArrayBuffer);
    const read = (ws: (typeof wb.worksheets)[number]) => {
      const rows: string[][] = [];
      ws.eachRow({ includeEmpty: false }, (row) => {
        const vals = (row.values as unknown[]).slice(1).map((v) => {
          if (v == null) return "";
          if (typeof v === "object") {
            const o = v as { text?: string; hyperlink?: string; result?: unknown; richText?: { text: string }[] };
            if (o.richText) return o.richText.map((t) => t.text).join("");
            if (o.text) return String(o.text).replace(/^mailto:/i, "");
            if (o.result != null) return String(o.result);
            if (o.hyperlink) return o.hyperlink.replace(/^mailto:/i, "");
          }
          return String(v);
        });
        rows.push(vals);
      });
      return rows.filter((r) => r.some((x) => x.trim()));
    };
    const sheets = wb.worksheets.map((ws) => ({ name: ws.name, rows: read(ws) }));
    // Priorité à un onglet dont toutes les lignes ont un e-mail (onglet « Import CRM »), sinon le premier avec une colonne e-mail.
    const withEmail = sheets.filter((s) => s.rows.length > 1 && mapColumns(s.rows[0]).includes("email"));
    const filled = (s: (typeof sheets)[number]) => {
      const i = mapColumns(s.rows[0]).indexOf("email");
      return s.rows.slice(1).filter((r) => r[i]?.includes("@")).length / Math.max(1, s.rows.length - 1);
    };
    const best = withEmail.sort((a, b) => filled(b) - filled(a))[0] ?? sheets[0];
    return { rows: best?.rows ?? [], sheet: best?.name };
  }
  return { rows: parseCsv(await file.text()) };
}

export const slugTag = (s: string) =>
  s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

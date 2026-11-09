import type { Prisma } from "@prisma/client";
import { getAdmin } from "@/lib/auth";
import { csvCell, STATUS } from "@/lib/crm";
import { db } from "@/lib/db";

/** Export CSV (Excel) des contacts, avec les filtres de la liste. */
export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q");
  const where: Prisma.ContactWhereInput = {
    ...(q ? { OR: ["email", "firstName", "lastName", "company", "city"].map((f) => ({ [f]: { contains: q, mode: "insensitive" } })) } : {}),
    ...(sp.get("status") ? { status: sp.get("status")! } : {}),
    ...(sp.get("segment") ? { segment: sp.get("segment")! } : {}),
    ...(sp.get("tag") ? { tags: { has: sp.get("tag")! } } : {}),
  };
  const rows = await db.contact.findMany({ where, orderBy: { createdAt: "desc" } });
  const head = ["E-mail", "Prénom", "Nom", "Société", "Fonction", "Téléphone", "Code postal", "Ville", "Segment", "Statut", "Étiquettes", "Montant estimé", "Provenance", "Base légale", "Désinscrit", "Dernier contact", "Créé le"];
  const lines = rows.map((c) =>
    [c.email, c.firstName, c.lastName, c.company, c.jobTitle, c.phone, c.postalCode, c.city, c.segment, STATUS[c.status]?.label ?? c.status, c.tags.join(", "), c.estimatedValue, c.source, c.consent, c.unsubscribed ? "oui" : "non", c.lastContactAt?.toLocaleDateString("fr-FR"), c.createdAt.toLocaleDateString("fr-FR")]
      .map(csvCell).join(";"),
  );
  return new Response("﻿" + [head.join(";"), ...lines].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="contacts-alsimat-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}

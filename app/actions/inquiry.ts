"use server";

import { z } from "zod";
import { syncInquiryToContact } from "@/lib/crm";
import { db } from "@/lib/db";
import { acknowledgementEmail, teamNotificationEmail, teamRecipients } from "@/lib/inquiry-emails";
import { sendRichMail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { getCompany } from "@/lib/settings";
import { savePrivateFile } from "@/lib/uploads";

export type InquiryState = { ok: boolean; message: string; errors?: Record<string, string> } | null;


const schema = z
  .object({
    type: z.enum(["devis", "contact", "sav"]),
    firstName: z.string().trim().min(1, "Prénom requis").max(80),
    lastName: z.string().trim().min(1, "Nom requis").max(80),
    company: z.string().trim().max(120).optional(),
    email: z.string().trim().email("E-mail invalide").max(160),
    phone: z.string().trim().max(30).optional(),
    postalCode: z.string().trim().max(10).optional(),
    subject: z.string().trim().max(160).optional(),
    message: z.string().trim().max(5000).optional(),
    vehicleRef: z.string().trim().max(160).optional(),
    serialNumber: z.string().trim().max(80).optional(),
    source: z.string().trim().max(300).optional(),
    consent: z.literal("on", { errorMap: () => ({ message: "Merci d'accepter le traitement de vos données" }) }),
  })
  .superRefine((d, ctx) => {
    if (d.type === "sav" && !d.serialNumber) ctx.addIssue({ code: "custom", path: ["serialNumber"], message: "Numéro de série requis" });
    if (d.type === "sav" && !d.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Téléphone requis pour le SAV" });
    if (d.type !== "devis" && !d.message) ctx.addIssue({ code: "custom", path: ["message"], message: "Message requis" });
  });

export async function submitInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  // Pièges à robots : champ caché rempli, ou formulaire envoyé trop vite.
  if (form.get("website")) return { ok: true, message: "Merci, votre demande a bien été envoyée." };
  const startedAt = Number(form.get("startedAt") || 0);
  if (startedAt && Date.now() - startedAt < 2500) return { ok: false, message: "Merci de patienter quelques secondes avant d'envoyer." };

  if (!(await rateLimit("inquiry", 6, 10 * 60_000)))
    return { ok: false, message: "Trop de demandes envoyées. Merci de réessayer dans quelques minutes ou de nous appeler." };

  const raw = Object.fromEntries(
    [...form.entries()].filter(([, v]) => typeof v === "string" && v !== "").map(([k, v]) => [k, v as string]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Merci de vérifier les champs indiqués.", errors };
  }
  const { consent: _c, ...data } = parsed.data;

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 6);
  let saved: string[] = [];
  try {
    const folder = `sav/${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 8)}`;
    saved = data.type === "sav" ? await Promise.all(files.map((f) => savePrivateFile(f, folder))) : [];
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Fichier refusé.", errors: { files: "Fichier refusé" } };
  }

  const inquiry = await db.inquiry.create({ data: { ...data, email: data.email.toLowerCase(), files: saved } });
  try {
    await syncInquiryToContact(inquiry.id);
  } catch (e) {
    console.error("[crm] synchronisation du contact impossible", e);
  }

  const company = await getCompany();
  const fresh = (await db.inquiry.findUnique({ where: { id: inquiry.id } })) ?? inquiry;
  const team = teamNotificationEmail(fresh, company);
  const ack = acknowledgementEmail(fresh, company);
  // Les deux envois sont indépendants : un échec ne bloque ni l'autre, ni la demande (déjà enregistrée).
  await Promise.allSettled([
    sendRichMail({ to: teamRecipients(company).join(", "), replyTo: data.email, fromName: "Site Alsimat", ...team }),
    sendRichMail({ to: data.email, replyTo: company.email, fromName: "Alsimat", ...ack }),
  ]).then((r) => r.forEach((x) => x.status === "rejected" && console.error("[mail] envoi impossible", x.reason)));

  return {
    ok: true,
    message:
      data.type === "sav"
        ? "Votre demande SAV a bien été enregistrée. Notre technicien vous recontacte dans les 48 h."
        : "Merci ! Votre demande a bien été envoyée. Un conseiller vous recontacte dans les 48 h.",
  };
}

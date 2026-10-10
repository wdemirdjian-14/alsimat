"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { getCompany } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { savePrivateFile } from "@/lib/uploads";

export type InquiryState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const TYPES = { devis: "Demande de devis", contact: "Message de contact", sav: "Demande SAV" } as const;

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

  const inquiry = await db.inquiry.create({ data: { ...data, files: saved } });

  const company = await getCompany();
  const label = TYPES[data.type];
  const lines = [
    `${label} reçue sur ${SITE_URL}`,
    "",
    `Nom : ${data.firstName} ${data.lastName}${data.company ? ` (${data.company})` : ""}`,
    `E-mail : ${data.email}`,
    data.phone && `Téléphone : ${data.phone}`,
    data.postalCode && `Code postal : ${data.postalCode}`,
    data.vehicleRef && `Véhicule : ${data.vehicleRef}`,
    data.serialNumber && `N° de série : ${data.serialNumber}`,
    data.subject && `Objet : ${data.subject}`,
    "",
    data.message ?? "",
    saved.length ? `\n${saved.length} pièce(s) jointe(s) à consulter dans l'admin.` : "",
    "",
    `Voir la demande : ${SITE_URL}/admin/demandes/${inquiry.id}`,
  ].filter((l): l is string => typeof l === "string");

  await Promise.all([
    sendMail({
      to: process.env.NOTIFY_EMAIL || company.email,
      replyTo: data.email,
      subject: `[Alsimat] ${label} – ${data.firstName} ${data.lastName}${data.vehicleRef ? ` – ${data.vehicleRef}` : ""}`,
      text: lines.join("\n"),
    }),
    sendMail({
      to: data.email,
      subject: `Alsimat – nous avons bien reçu votre ${label.toLowerCase()}`,
      text: `Bonjour ${data.firstName},\n\nMerci pour votre ${label.toLowerCase()}${data.vehicleRef ? ` concernant « ${data.vehicleRef} »` : ""}. Notre équipe revient vers vous très rapidement.\n\nPour toute urgence : ${company.phone}.\n\nL'équipe Alsimat\n${SITE_URL}`,
    }),
  ]);

  return {
    ok: true,
    message:
      data.type === "sav"
        ? "Votre demande SAV a bien été enregistrée. Notre technicien vous recontacte rapidement."
        : "Merci ! Votre demande a bien été envoyée. Nous revenons vers vous très rapidement.",
  };
}

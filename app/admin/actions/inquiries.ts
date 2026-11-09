"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { syncInquiryToContact } from "@/lib/crm";
import { db } from "@/lib/db";
import { addInternalNote, sendDirectEmail } from "@/lib/direct-mail";
import { INQUIRY_STATUS } from "@/lib/inquiry-labels";

/** Changement de statut en un geste (boutons rapides sur mobile). */
export async function setInquiryStatus(id: string, status: string) {
  await requireAdmin();
  if (!INQUIRY_STATUS[status]) return;
  await db.inquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
}

/** Garantit que la demande est rattachée à une fiche contact (vue 360). */
async function inquiryContact(id: string) {
  let q = await db.inquiry.findUniqueOrThrow({ where: { id } });
  if (!q.contactId) {
    await syncInquiryToContact(id);
    q = await db.inquiry.findUniqueOrThrow({ where: { id } });
  }
  return q as typeof q & { contactId: string };
}

/** Message au client depuis la demande : e-mail avec pièces jointes, tracé sur la demande et la fiche contact. */
export async function replyToInquiry(id: string, _prev: string | null, fd: FormData): Promise<string | null> {
  const admin = await requireAdmin();
  const q = await inquiryContact(id);
  const res = await sendDirectEmail({ fd, author: admin.email, contactId: q.contactId, inquiryId: id });
  if (res !== "ok") return res;
  await db.inquiry.update({ where: { id }, data: { status: fd.get("close") ? "traite" : q.status === "nouveau" ? "en_cours" : q.status } });
  revalidatePath("/admin", "layout");
  return "ok";
}

/** Note interne (et pièces jointes) sur la demande, visible aussi dans l'historique du contact. */
export async function addInquiryNote(id: string, _prev: string | null, fd: FormData): Promise<string | null> {
  const admin = await requireAdmin();
  const q = await inquiryContact(id);
  const res = await addInternalNote({ fd, author: admin.email, contactId: q.contactId, inquiryId: id });
  revalidatePath("/admin", "layout");
  return res;
}

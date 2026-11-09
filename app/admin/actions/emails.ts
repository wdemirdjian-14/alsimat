"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { contactForEmail, sendDirectEmail } from "@/lib/direct-mail";

/** E-mail unique depuis l'onglet « E-mails » : le destinataire est rattaché (ou ajouté) au CRM. */
export async function sendSingleEmail(_prev: string | null, fd: FormData): Promise<string | null> {
  const admin = await requireAdmin();
  const to = String(fd.get("to") ?? "").trim().toLowerCase();
  if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(to)) return "Adresse du destinataire invalide.";
  const contact = await contactForEmail(to, { firstName: String(fd.get("firstName") ?? "").trim() || null, company: String(fd.get("company") ?? "").trim() || null });
  const res = await sendDirectEmail({ fd, author: admin.email, contactId: contact.id });
  revalidatePath("/admin/emails");
  revalidatePath(`/admin/contacts/${contact.id}`);
  return res === "ok" ? `ok:${contact.id}` : res;
}

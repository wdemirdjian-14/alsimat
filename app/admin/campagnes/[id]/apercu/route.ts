import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { renderEmail } from "@/lib/email-template";
import { getSetting } from "@/lib/settings";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const c = await db.campaign.findUnique({ where: { id: (await params).id } });
  if (!c) return new Response("Not found", { status: 404 });
  const m = await getSetting("marketing");
  const { html } = renderEmail({
    subject: c.subject, preheader: c.preheader, body: c.body, image: c.image, ctaLabel: c.ctaLabel, ctaUrl: c.ctaUrl,
    merge: { prenom: "Jean", nom: "Dupont", societe: "Camping des Pins", ville: "Orléans" }, senderName: m.senderName, postalAddress: m.postalAddress, unsubscribe: "#",
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

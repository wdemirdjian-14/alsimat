import { db } from "./db";

export async function unsubscribeByToken(token: string) {
  const r = await db.campaignRecipient.findUnique({ where: { token }, include: { campaign: true } });
  if (!r) return null;
  const c = await db.contact.update({ where: { id: r.contactId }, data: { unsubscribed: true, unsubscribedAt: new Date() } });
  await db.activity.create({ data: { contactId: c.id, type: "campagne", title: "Désinscription des e-mails", content: `Via la campagne « ${r.campaign.name} »` } });
  return c;
}

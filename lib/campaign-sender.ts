import { audienceWhere, type Audience } from "./crm";
import { db } from "./db";
import { merge, renderEmail, unsubscribeUrl, oneClickUnsubscribeUrl } from "./email-template";
import { sendRichMail } from "./mail";
import { getSetting } from "./settings";

/** Prépare la liste des destinataires d'une campagne (à l'instant du lancement). */
export async function materializeRecipients(campaignId: string) {
  const c = await db.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  const contacts = await db.contact.findMany({ where: audienceWhere(c.audience as Audience), select: { id: true } });
  await db.campaignRecipient.createMany({ data: contacts.map((x) => ({ campaignId, contactId: x.id })), skipDuplicates: true });
  return contacts.length;
}

/**
 * Appelé chaque minute par le cron du serveur : lance les campagnes programmées,
 * puis envoie un lot d'e-mails en respectant le débit par minute et le plafond quotidien.
 */
export async function processCampaigns() {
  const now = new Date();
  for (const c of await db.campaign.findMany({ where: { status: "programmee", scheduledAt: { lte: now } } })) {
    await materializeRecipients(c.id);
    await db.campaign.update({ where: { id: c.id }, data: { status: "envoi", startedAt: now } });
  }

  const m = await getSetting("marketing");
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const sentToday = await db.campaignRecipient.count({ where: { sentAt: { gte: startOfDay } } });
  let budget = Math.max(0, Math.min(m.perMinute, m.dailyLimit - sentToday));
  const report = { sent: 0, failed: 0, skipped: 0, remainingToday: m.dailyLimit - sentToday };

  for (const c of await db.campaign.findMany({ where: { status: "envoi" }, orderBy: { startedAt: "asc" } })) {
    if (budget <= 0) break;
    const batch = await db.campaignRecipient.findMany({ where: { campaignId: c.id, status: "attente" }, include: { contact: true }, take: budget });
    if (!batch.length) {
      await db.campaign.update({ where: { id: c.id }, data: { status: "envoyee", finishedAt: now } });
      continue;
    }
    for (const r of batch) {
      if (r.contact.unsubscribed || r.contact.bounced) {
        await db.campaignRecipient.update({ where: { id: r.id }, data: { status: "ignore" } });
        report.skipped++;
        continue;
      }
      const { html, text } = renderEmail({
        subject: c.subject, preheader: c.preheader, body: c.body, image: c.image, ctaLabel: c.ctaLabel, ctaUrl: c.ctaUrl,
        merge: { prenom: r.contact.firstName, nom: r.contact.lastName, societe: r.contact.company, ville: r.contact.city },
        senderName: m.senderName, postalAddress: m.postalAddress, token: r.token, unsubscribe: unsubscribeUrl(r.token),
      });
      try {
        await sendRichMail({ to: r.contact.email, subject: merge(c.subject, { prenom: r.contact.firstName, nom: r.contact.lastName, societe: r.contact.company, ville: r.contact.city }).replace(/^[\s,]+/, "").trim(), html, text, fromName: m.senderName, replyTo: m.replyTo, unsubscribeUrl: oneClickUnsubscribeUrl(r.token), marketing: true });
        await db.campaignRecipient.update({ where: { id: r.id }, data: { status: "envoye", sentAt: new Date() } });
        await db.contact.update({ where: { id: r.contactId }, data: { lastContactAt: new Date() } });
        report.sent++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const hardBounce = /5\d\d|user unknown|does not exist|no such user|mailbox unavailable/i.test(msg);
        await db.campaignRecipient.update({ where: { id: r.id }, data: { status: "echec", error: msg.slice(0, 300) } });
        if (hardBounce) await db.contact.update({ where: { id: r.contactId }, data: { bounced: true } });
        report.failed++;
      }
      budget--;
    }
  }
  return report;
}

import "server-only";
import webpush from "web-push";
import { db } from "./db";
import { SITE_URL } from "./site";

/**
 * Notifications push de l'admin (Web Push / VAPID).
 * Les clés sont lues dans l'environnement (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) ou, à défaut,
 * générées une seule fois et conservées dans la base : aucune configuration nécessaire.
 */
let cached: { publicKey: string; privateKey: string } | null = null;

export async function vapidKeys() {
  if (cached) return cached;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    cached = { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
    return cached;
  }
  const row = await db.siteSetting.findUnique({ where: { key: "vapid" } });
  if (row) {
    cached = JSON.parse(row.value);
    return cached!;
  }
  const keys = webpush.generateVAPIDKeys();
  await db.siteSetting.upsert({ where: { key: "vapid" }, update: {}, create: { key: "vapid", value: JSON.stringify(keys) } });
  cached = (JSON.parse((await db.siteSetting.findUniqueOrThrow({ where: { key: "vapid" } })).value));
  return cached!;
}

export type PushTopic = "demandes" | "campagnes";

/** Envoie une notification à tous les appareils abonnés au sujet ; nettoie les abonnements expirés. */
export async function notifyAdmins(topic: PushTopic, payload: { title: string; body: string; url: string; tag?: string }) {
  const subs = await db.pushSubscription.findMany({ where: { topics: { has: topic } } });
  if (!subs.length) return 0;
  const { publicKey, privateKey } = await vapidKeys();
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || `mailto:admin@${new URL(SITE_URL).hostname}`, publicKey, privateKey);
  const badge = await db.inquiry.count({ where: { status: "nouveau" } });
  const body = JSON.stringify({ ...payload, badge });
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 86400, urgency: "high" });
        sent++;
        await db.pushSubscription.update({ where: { id: s.id }, data: { lastUsed: new Date() } });
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        else console.error("[push] envoi impossible", code ?? e);
      }
    }),
  );
  return sent;
}

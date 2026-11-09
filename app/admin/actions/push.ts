"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyAdmins, vapidKeys } from "@/lib/push";

export async function getPushPublicKey() {
  await requireAdmin();
  return (await vapidKeys()).publicKey;
}

export async function savePushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }, device: string, topics: string[]) {
  const user = await requireAdmin();
  if (!sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) throw new Error("Abonnement invalide.");
  const clean = topics.filter((t) => ["demandes", "campagnes"].includes(t));
  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { userId: user.id, p256dh: sub.keys.p256dh, auth: sub.keys.auth, device: device.slice(0, 120), topics: clean },
    create: { userId: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, device: device.slice(0, 120), topics: clean },
  });
}

export async function removePushSubscription(endpoint: string) {
  await requireAdmin();
  await db.pushSubscription.deleteMany({ where: { endpoint } });
}

export async function sendTestPush() {
  await requireAdmin();
  const n = await notifyAdmins("demandes", { title: "🔔 Notifications activées", body: "Vous serez prévenu ici à chaque nouvelle demande du site.", url: "/admin/demandes", tag: "test" });
  return n;
}

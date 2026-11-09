/* Service worker de l'application Alsimat Admin : notifications push + page hors ligne. */
const OFFLINE = `<!doctype html><html lang="fr"><meta name="viewport" content="width=device-width"><body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#0d2420;color:#fff;font-family:system-ui;text-align:center;padding:24px"><div><p style="font-size:42px;margin:0">📡</p><h1 style="font-size:20px">Pas de connexion</h1><p style="opacity:.7">Reconnectez-vous à Internet pour accéder à l'admin Alsimat.</p><button onclick="location.reload()" style="margin-top:12px;padding:12px 22px;border-radius:999px;border:0;background:#46a584;color:#fff;font-weight:bold">Réessayer</button></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Navigation : toujours le réseau (données à jour) ; page de secours si hors ligne.
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => new Response(OFFLINE, { headers: { "Content-Type": "text/html; charset=utf-8" } })));
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: "Alsimat", body: e.data && e.data.text() }; }
  const show = self.registration.showNotification(d.title || "Alsimat", {
    body: d.body || "",
    icon: "/admin-icon-192.png",
    badge: "/admin-badge.png",
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { url: d.url || "/admin" },
    vibrate: [80, 40, 80],
  });
  const badge = typeof d.badge === "number" && self.navigator.setAppBadge ? self.navigator.setAppBadge(d.badge).catch(() => {}) : Promise.resolve();
  e.waitUntil(Promise.all([show, badge]));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || "/admin", self.location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if (c.url.startsWith(self.location.origin + "/admin")) return c.focus().then(() => c.navigate(url));
      return self.clients.openWindow(url);
    }),
  );
});

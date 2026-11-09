"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCircle2, Download, Loader2, Send, Share } from "lucide-react";
import { getPushPublicKey, removePushSubscription, savePushSubscription, sendTestPush } from "@/app/admin/actions/push";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const isIOS = () => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

function b64ToUint8(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function deviceName() {
  const ua = navigator.userAgent;
  const os = /iphone/i.test(ua) ? "iPhone" : /ipad/i.test(ua) ? "iPad" : /android/i.test(ua) ? "Android" : /mac/i.test(ua) ? "Mac" : /windows/i.test(ua) ? "Windows" : "Appareil";
  const br = /edg/i.test(ua) ? "Edge" : /firefox/i.test(ua) ? "Firefox" : /chrome|crios/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "";
  return `${os}${br ? ` · ${br}` : ""}${isStandalone() ? " · application" : ""}`;
}

/** Enregistre le service worker de l'admin (notifications + page hors ligne). */
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch(() => {});
    // Ouvrir l'app remet la pastille de l'icône à zéro.
    (navigator as Navigator & { clearAppBadge?: () => Promise<void> }).clearAppBadge?.().catch(() => {});
  }, []);
  return null;
}

/** Bouton « Installer l'application » (Android/Chrome) ou mode d'emploi iPhone. */
export function InstallApp() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIOS());
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  if (installed) return <p className="flex items-center gap-2 text-sm text-brand-700"><CheckCircle2 className="h-4 w-4" /> Application installée sur cet appareil.</p>;
  if (evt) return <button type="button" onClick={async () => { await evt.prompt(); const c = await evt.userChoice; if (c.outcome === "accepted") setInstalled(true); }} className="btn-primary !py-2.5"><Download className="h-4 w-4" /> Installer l'application</button>;
  if (ios) return (
    <ol className="space-y-1 text-sm text-ink-soft">
      <li>1. Dans <strong>Safari</strong>, touchez <Share className="inline h-4 w-4 align-text-bottom" /> <strong>Partager</strong>.</li>
      <li>2. Choisissez <strong>« Sur l'écran d'accueil »</strong>, puis <strong>Ajouter</strong>.</li>
      <li>3. Ouvrez <strong>Alsimat</strong> depuis l'écran d'accueil pour activer les notifications.</li>
    </ol>
  );
  return <p className="text-sm text-ink-soft">Sur ordinateur : icône « Installer » dans la barre d'adresse de Chrome/Edge. Sur Android : menu ⋮ → « Installer l'application ».</p>;
}

/** Activation des notifications push sur l'appareil courant. */
export function PushToggle() {
  const [state, setState] = useState<"loading" | "unsupported" | "ios-install" | "denied" | "off" | "on">("loading");
  const [topics, setTopics] = useState<string[]>(["demandes", "campagnes"]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      if (isIOS() && !isStandalone()) return setState("ios-install");
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" });
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  const enable = async () => {
    setBusy(true); setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "denied" : "off"); return; }
      const reg = await navigator.serviceWorker.ready;
      const key = await getPushPublicKey();
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(key) }));
      await savePushSubscription(JSON.parse(JSON.stringify(sub)), deviceName(), topics);
      setState("on");
      const n = await sendTestPush();
      setMsg(n ? "Notification de test envoyée ✔" : "Abonnement enregistré.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Activation impossible.");
    } finally { setBusy(false); }
  };
  const disable = async () => {
    setBusy(true);
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) { await removePushSubscription(sub.endpoint); await sub.unsubscribe(); }
    setState("off"); setBusy(false); setMsg("");
  };
  const saveTopics = async (next: string[]) => {
    setTopics(next);
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await savePushSubscription(JSON.parse(JSON.stringify(sub)), deviceName(), next);
  };

  if (state === "loading") return <Loader2 className="h-5 w-5 animate-spin text-ink/40" />;
  if (state === "unsupported") return <p className="text-sm text-ink-soft">Ce navigateur ne gère pas les notifications. Utilisez Chrome, Edge, Firefox ou Safari récent.</p>;
  if (state === "ios-install") return <p className="text-sm text-ink-soft">Sur iPhone, installez d'abord l'application sur l'écran d'accueil (ci-dessus), puis ouvrez-la pour activer les notifications.</p>;
  if (state === "denied") return <p className="text-sm text-red-600">Notifications bloquées pour ce site. Autorisez-les dans les réglages du navigateur (cadenas à gauche de l'adresse), puis rechargez.</p>;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        {[["demandes", "Nouvelles demandes (devis, contact, SAV, Walau)"], ["campagnes", "Fin d'envoi des campagnes"]].map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={topics.includes(k)} onChange={(e) => saveTopics(e.target.checked ? [...topics, k] : topics.filter((t) => t !== k))} /> {l}
          </label>
        ))}
      </div>
      {state === "on" ? (
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700"><Bell className="h-4 w-4" /> Activées sur cet appareil</span>
          <button type="button" disabled={busy} onClick={async () => { setBusy(true); const n = await sendTestPush(); setMsg(n ? "Notification de test envoyée ✔" : "Aucun appareil abonné."); setBusy(false); }} className="btn-ghost !py-2 text-ink"><Send className="h-4 w-4" /> Tester</button>
          <button type="button" disabled={busy} onClick={disable} className="btn-ghost !py-2 text-red-600"><BellOff className="h-4 w-4" /> Désactiver</button>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={enable} className="btn-primary !py-2.5">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} Activer les notifications</button>
      )}
      {msg && <p className="text-sm text-brand-700">{msg}</p>}
    </div>
  );
}

/** Bandeau du tableau de bord : invite à activer les notifications tant que ce n'est pas fait. */
export function PushPrompt() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    (async () => {
      try { if (localStorage.getItem("alsimat-push-prompt") === "no") return; } catch {}
      if (!("serviceWorker" in navigator)) return;
      if (isIOS() && !isStandalone()) return setShow(true);
      if (!("PushManager" in window) || Notification.permission === "denied") return;
      const reg = await navigator.serviceWorker.getRegistration("/admin");
      const sub = await reg?.pushManager.getSubscription();
      setShow(!sub);
    })().catch(() => {});
  }, []);
  if (!show) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-ink p-4 text-white">
      <Bell className="h-6 w-6 shrink-0 text-brand-300" />
      <p className="min-w-0 flex-1 text-sm">
        <strong className="block">Soyez alerté à chaque nouvelle demande</strong>
        <span className="hidden text-white/70 sm:inline">Installez l'app Alsimat sur votre téléphone et activez les notifications.</span>
      </p>
      <a href="/admin/compte#application" className="btn-primary !py-2">Activer</a>
      <button type="button" onClick={() => { try { localStorage.setItem("alsimat-push-prompt", "no"); } catch {} setShow(false); }} className="text-xs text-white/60 underline">Plus tard</button>
    </div>
  );
}

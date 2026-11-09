import type { Inquiry } from "@prisma/client";
import { SITE_URL, telHref, type CompanyInfo } from "./site";

/** E-mails automatiques des demandes du site : accusé de réception (client) et alerte (équipe). */

const esc = (s: string | null | undefined) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const nl2br = (s: string | null | undefined) => esc(s).replace(/\r?\n/g, "<br>");

const KIND = {
  devis: { label: "Demande de devis", short: "demande de devis", team: "notre conseiller commercial", icon: "📋" },
  contact: { label: "Message", short: "message", team: "notre équipe", icon: "✉️" },
  sav: { label: "Demande SAV", short: "demande SAV", team: "notre service après-vente", icon: "🔧" },
} as const;

const btn = (href: string, label: string, primary = true) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:4px 8px 4px 0;padding:13px 22px;border-radius:999px;font-weight:bold;font-size:14px;text-decoration:none;${
    primary ? "background:#46a584;color:#ffffff" : "background:#ffffff;color:#0d2420;border:1px solid #d5ddd9"
  }">${label}</a>`;

function layout(o: { preheader: string; head: string; body: string; footer: string }) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"></head>
<body style="margin:0;background:#f5f3ee;font-family:Arial,Helvetica,sans-serif;color:#3f5550;font-size:15px;line-height:1.6">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden">
<tr><td style="background:#0d2420;padding:22px 28px"><a href="${SITE_URL}"><img src="${SITE_URL}/logo-alsimat-blanc.png" alt="Alsimat" height="40" style="height:40px;width:auto;border:0"></a></td></tr>
<tr><td style="background:#0d2420;padding:8px 28px 34px;color:#ffffff">${o.head}</td></tr>
<tr><td style="padding:28px">${o.body}</td></tr>
<tr><td style="padding:20px 28px;background:#f5f3ee;font-size:12px;color:#7a8a86">${o.footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function recap(q: Inquiry) {
  const rows: [string, string | null | undefined][] = [
    ["Véhicule", q.vehicleRef],
    ["N° de série", q.serialNumber],
    ["Objet", q.subject && q.subject !== "Message via Walau" ? q.subject : null],
    ["Société", q.company],
    ["Téléphone", q.phone],
    ["Code postal", q.postalCode],
  ];
  return rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 0;color:#7a8a86;width:130px;vertical-align:top">${k}</td><td style="padding:6px 0;color:#0d2420;font-weight:bold">${esc(v)}</td></tr>`)
    .join("");
}

/** Accusé de réception envoyé au visiteur. */
export function acknowledgementEmail(q: Inquiry, company: CompanyInfo) {
  const k = KIND[q.type as keyof typeof KIND] ?? KIND.contact;
  const subject = `${q.firstName}, votre ${k.short} est bien enregistrée ✔`;
  const html = layout({
    preheader: `Merci ! ${k.team.charAt(0).toUpperCase() + k.team.slice(1)} vous recontacte dans les 48 h.`,
    head: `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:52px;height:52px;border-radius:50%;background:#46a584;text-align:center;font-size:26px;color:#fff">✓</td></tr></table>
<h1 style="margin:18px 0 6px;font-size:26px;line-height:1.25;color:#ffffff">Merci ${esc(q.firstName)}, c'est bien reçu !</h1>
<p style="margin:0;color:#aee4c7;font-size:16px">Votre ${k.short} a été transmise à ${k.team}.</p>`,
    body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eefaf3;border-radius:14px"><tr><td style="padding:18px 20px">
<p style="margin:0;font-size:17px;color:#0d2420"><strong>⏱ Nous vous recontactons dans les 48 h</strong></p>
<p style="margin:6px 0 0">${q.type === "sav" ? "Un technicien Alsimat étudie votre demande et vous rappelle pour organiser l'intervention." : "Un conseiller Alsimat étudie votre besoin et revient vers vous par téléphone ou par e-mail."}</p>
</td></tr></table>
${recap(q) || q.message ? `<h2 style="margin:28px 0 8px;font-size:16px;color:#0d2420">Récapitulatif de votre ${k.short}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${recap(q)}</table>
${q.message ? `<div style="margin-top:10px;padding:14px 16px;border-left:3px solid #46a584;background:#f5f3ee;border-radius:6px;color:#3f5550">${nl2br(q.message)}</div>` : ""}` : ""}
<h2 style="margin:28px 0 8px;font-size:16px;color:#0d2420">En attendant</h2>
<p style="margin:0 0 12px">Découvrez nos modèles du moment ou appelez-nous si votre demande est urgente.</p>
${btn(`${SITE_URL}/#moment`, "Voir les véhicules du moment")}${btn(telHref(company.phone), `📞 ${esc(company.phone)}`, false)}`,
    footer: `<strong style="color:#3f5550">${esc(company.name)}</strong> · golfettes et véhicules électriques · conseil, livraison et SAV sur site<br>
<a href="${SITE_URL}" style="color:#2a6d57">alsimat.com</a> · ${esc(company.phone)} · ${esc(company.email)}<br><br>
Vous recevez cet e-mail suite à votre demande sur alsimat.com. Pour compléter votre demande, répondez simplement à ce message.`,
  });
  const text = `Bonjour ${q.firstName},

Merci, votre ${k.short} est bien enregistrée. ${k.team.charAt(0).toUpperCase() + k.team.slice(1)} vous recontacte dans les 48 h.
${q.vehicleRef ? `\nVéhicule : ${q.vehicleRef}` : ""}${q.serialNumber ? `\nN° de série : ${q.serialNumber}` : ""}${q.message ? `\n\nVotre message :\n${q.message}` : ""}

Une urgence ? ${company.phone}

L'équipe Alsimat
${SITE_URL}`;
  return { subject, html, text };
}

/** Alerte envoyée à l'équipe Alsimat. */
export function teamNotificationEmail(q: Inquiry, company: CompanyInfo) {
  const k = KIND[q.type as keyof typeof KIND] ?? KIND.contact;
  const name = `${q.firstName} ${q.lastName}`;
  const deadline = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(new Date(q.createdAt.getTime() + 48 * 3600_000));
  const subject = `${k.icon} ${k.label} – ${name}${q.company ? ` (${q.company})` : ""}${q.vehicleRef ? ` – ${q.vehicleRef}` : ""}`;
  const reply = `mailto:${q.email}?subject=${encodeURIComponent(`Re : votre ${k.short} – Alsimat`)}&body=${encodeURIComponent(`Bonjour ${q.firstName},\n\n`)}`;
  const html = layout({
    preheader: `${name} · ${q.email}${q.phone ? ` · ${q.phone}` : ""} — à recontacter avant ${deadline}`,
    head: `<p style="margin:0;display:inline-block;padding:4px 12px;border-radius:999px;background:#46a584;color:#fff;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px">${k.icon} Nouvelle ${k.label.toLowerCase()}</p>
<h1 style="margin:14px 0 4px;font-size:26px;line-height:1.25;color:#ffffff">${esc(name)}</h1>
<p style="margin:0;color:#aee4c7;font-size:15px">${esc(q.company ?? "")}${q.company ? " · " : ""}reçue le ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" }).format(q.createdAt)}</p>`,
    body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7e6;border-radius:14px"><tr><td style="padding:14px 18px;color:#8a5a00"><strong>⏱ À recontacter avant ${esc(deadline)}</strong> (engagement 48 h annoncé au client)</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">
<tr><td style="padding:6px 0;color:#7a8a86;width:130px">E-mail</td><td style="padding:6px 0"><a href="mailto:${esc(q.email)}" style="color:#2a6d57;font-weight:bold">${esc(q.email)}</a></td></tr>
${recap(q)}
${q.source ? `<tr><td style="padding:6px 0;color:#7a8a86;vertical-align:top">Provenance</td><td style="padding:6px 0;color:#0d2420">${esc(q.source)}</td></tr>` : ""}
${q.files.length ? `<tr><td style="padding:6px 0;color:#7a8a86">Pièces jointes</td><td style="padding:6px 0;color:#0d2420">${q.files.length} fichier(s) dans l'admin</td></tr>` : ""}
</table>
${q.message ? `<div style="margin-top:14px;padding:16px;border-left:3px solid #46a584;background:#f5f3ee;border-radius:6px;color:#0d2420">${nl2br(q.message)}</div>` : ""}
<div style="margin-top:24px">${btn(reply, "✉️ Répondre")}${q.phone ? btn(telHref(q.phone), `📞 ${esc(q.phone)}`, false) : ""}</div>
<div style="margin-top:4px">${btn(`${SITE_URL}/admin/demandes/${q.id}`, "Voir la demande", false)}${q.contactId ? btn(`${SITE_URL}/admin/contacts/${q.contactId}`, "Fiche contact (CRM)", false) : ""}</div>`,
    footer: `Notification automatique du site ${SITE_URL.replace(/^https?:\/\//, "")}. Répondre à cet e-mail écrit directement à ${esc(q.email)}.<br>Destinataires réglables dans Admin → Paramètres → Entreprise.`,
  });
  const text = `${k.label} – ${name}${q.company ? ` (${q.company})` : ""}
À recontacter avant ${deadline}.

E-mail : ${q.email}${q.phone ? `\nTéléphone : ${q.phone}` : ""}${q.vehicleRef ? `\nVéhicule : ${q.vehicleRef}` : ""}${q.serialNumber ? `\nN° de série : ${q.serialNumber}` : ""}${q.postalCode ? `\nCode postal : ${q.postalCode}` : ""}${q.source ? `\nProvenance : ${q.source}` : ""}
${q.message ? `\n${q.message}\n` : ""}
Voir la demande : ${SITE_URL}/admin/demandes/${q.id}`;
  return { subject, html, text };
}

/** Destinataires de l'alerte équipe : contact@ + réglages admin + NOTIFY_EMAIL, sans doublon. */
export function teamRecipients(company: CompanyInfo) {
  return [...new Set(["contact@alsimat.com", company.email, ...(company.notifyEmails ?? "").split(/[,;\s]+/), ...(process.env.NOTIFY_EMAIL ?? "").split(/[,;\s]+/)]
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))];
}

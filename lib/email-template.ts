import { createHmac } from "node:crypto";
import { SITE_URL } from "./site";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export type Merge = { prenom?: string | null; nom?: string | null; societe?: string | null; ville?: string | null };

/** Champs de fusion : {{prenom}}, {{nom}}, {{societe}}, {{ville}} (avec repli « Bonjour, »). */
export function merge(text: string, m: Merge) {
  return text
    .replace(/\{\{\s*prenom\s*\}\}/gi, m.prenom || "")
    .replace(/\{\{\s*nom\s*\}\}/gi, m.nom || "")
    .replace(/\{\{\s*societe\s*\}\}/gi, m.societe || "votre établissement")
    .replace(/\{\{\s*ville\s*\}\}/gi, m.ville || "votre ville")
    .replace(/Bonjour\s+,/g, "Bonjour,");
}

const signKey = () => process.env.AUTH_SECRET || "dev";
export const signUrl = (token: string, url: string) => createHmac("sha256", signKey()).update(`${token}|${url}`).digest("hex").slice(0, 24);
export const trackedLink = (token: string, url: string) =>
  `${SITE_URL}/api/m/c/${token}?u=${encodeURIComponent(url)}&s=${signUrl(token, url)}`;
export const unsubscribeUrl = (token: string) => `${SITE_URL}/desinscription/${token}`;
/** Désinscription « en un clic » (RFC 8058) appelée directement par Gmail, Outlook… */
export const oneClickUnsubscribeUrl = (token: string) => `${SITE_URL}/api/m/u/${token}`;

/** Mise en forme légère : ## titres, - listes, **gras**, [liens](url), paragraphes. */
function bodyToHtml(body: string, link: (u: string) => string) {
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${esc(link(u.startsWith("/") ? SITE_URL + u : u))}" style="color:#2a6d57;font-weight:600">${t}</a>`);
  return body
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      if (b.startsWith("## ")) return `<h2 style="margin:28px 0 10px;font-size:20px;color:#0d2420">${inline(b.slice(3))}</h2>`;
      const lines = b.split("\n");
      if (lines.every((l) => /^[-*] /.test(l)))
        return `<ul style="margin:0 0 16px;padding-left:20px">${lines.map((l) => `<li style="margin:4px 0">${inline(l.slice(2))}</li>`).join("")}</ul>`;
      return `<p style="margin:0 0 16px">${lines.map(inline).join("<br>")}</p>`;
    })
    .join("");
}

export function renderEmail(o: {
  subject: string;
  preheader?: string | null;
  body: string;
  image?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  merge: Merge;
  senderName: string;
  postalAddress?: string;
  token?: string;
  unsubscribe?: string;
}) {
  const link = (u: string) => (o.token ? trackedLink(o.token, u) : u);
  const body = merge(o.body, o.merge);
  const img = o.image ? (o.image.startsWith("/") ? SITE_URL + o.image : o.image) : null;
  const cta = o.ctaUrl ? (o.ctaUrl.startsWith("/") ? SITE_URL + o.ctaUrl : o.ctaUrl) : null;
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(o.subject)}</title></head>
<body style="margin:0;background:#f5f3ee;font-family:Arial,Helvetica,sans-serif;color:#3f5550;font-size:15px;line-height:1.6">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader ?? "")}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden">
<tr><td style="background:#0d2420;padding:22px 28px"><a href="${esc(link(SITE_URL))}"><img src="${SITE_URL}/logo-alsimat.png" alt="Alsimat" height="40" style="height:40px;filter:brightness(0) invert(1)"></a></td></tr>
${img ? `<tr><td><a href="${esc(link(cta ?? SITE_URL))}"><img src="${esc(img)}" alt="" width="600" style="display:block;width:100%;height:auto"></a></td></tr>` : ""}
<tr><td style="padding:30px 28px 10px">${bodyToHtml(body, link)}</td></tr>
${cta && o.ctaLabel ? `<tr><td style="padding:4px 28px 30px"><a href="${esc(link(cta))}" style="display:inline-block;background:#46a584;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px">${esc(o.ctaLabel)}</a></td></tr>` : ""}
<tr><td style="padding:20px 28px;background:#f5f3ee;font-size:12px;color:#7a8a86">
${esc(o.senderName)} · golfettes et véhicules électriques · <a href="${esc(link(SITE_URL))}" style="color:#2a6d57">alsimat.com</a>${o.postalAddress ? `<br>${esc(o.postalAddress)}` : ""}
${o.unsubscribe ? `<br><br>Vous recevez cet e-mail en tant que professionnel susceptible d'être intéressé par nos véhicules. <a href="${esc(o.unsubscribe)}" style="color:#7a8a86">Se désinscrire</a>` : ""}
</td></tr></table></td></tr></table>
${o.token ? `<img src="${SITE_URL}/api/m/o/${o.token}" width="1" height="1" alt="" style="display:block">` : ""}
</body></html>`;
  const text = [
    body.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)").replace(/^## /gm, ""),
    cta && o.ctaLabel ? `${o.ctaLabel} : ${cta}` : "",
    `--\n${o.senderName} – ${SITE_URL}${o.postalAddress ? `\n${o.postalAddress}` : ""}`,
    o.unsubscribe ? `Se désinscrire : ${o.unsubscribe}` : "",
  ].filter(Boolean).join("\n\n");
  return { html, text };
}

import nodemailer from "nodemailer";

/**
 * Envoi d'e-mails via SMTP (ex. IONOS : smtp.ionos.fr, port 587).
 * Sans configuration SMTP, les demandes restent enregistrées dans l'admin et aucun e-mail n'est envoyé.
 */
const configured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

export async function sendMail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!configured()) {
    console.info(`[mail] SMTP non configuré — e-mail non envoyé : ${opts.subject}`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM || `Alsimat <${process.env.SMTP_USER}>`,
      ...opts,
    });
    return true;
  } catch (e) {
    console.error("[mail] échec d'envoi", e);
    return false;
  }
}

/**
 * E-mails de prospection / campagnes : serveur d'envoi distinct conseillé (ex. Brevo :
 * smtp-relay.brevo.com:587) pour préserver la réputation des e-mails courants. À défaut, SMTP principal.
 */
let marketingTransporter: nodemailer.Transporter | null = null;
export const marketingConfigured = () =>
  Boolean((process.env.MARKETING_SMTP_HOST && process.env.MARKETING_SMTP_USER) || configured());

function getMarketingTransporter() {
  if (!process.env.MARKETING_SMTP_HOST) return getTransporter();
  if (!marketingTransporter) {
    const port = Number(process.env.MARKETING_SMTP_PORT || 587);
    marketingTransporter = nodemailer.createTransport({
      host: process.env.MARKETING_SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.MARKETING_SMTP_USER, pass: process.env.MARKETING_SMTP_PASSWORD },
    });
  }
  return marketingTransporter;
}

export async function sendRichMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
  replyTo?: string;
  unsubscribeUrl?: string;
  marketing?: boolean;
}) {
  if (opts.marketing ? !marketingConfigured() : !configured()) throw new Error("Aucun serveur d'envoi configuré (SMTP).");
  const fromAddr = (opts.marketing && process.env.MARKETING_MAIL_FROM) || process.env.MAIL_FROM || `<${process.env.SMTP_USER}>`;
  const address = fromAddr.match(/<([^>]+)>/)?.[1] ?? fromAddr;
  await (opts.marketing ? getMarketingTransporter() : getTransporter()).sendMail({
    from: opts.fromName ? `"${opts.fromName.replace(/"/g, "")}" <${address}>` : fromAddr,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo || undefined,
    headers: opts.unsubscribeUrl
      ? { "List-Unsubscribe": `<${opts.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }
      : undefined,
  });
}

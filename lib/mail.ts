import nodemailer from "nodemailer";

/**
 * Envoi d'e-mails via SMTP (ex. IONOS : smtp.ionos.fr, port 587).
 * Sans configuration SMTP, les demandes restent enregistrées dans l'admin et aucun e-mail n'est envoyé.
 */
const ownSmtp = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
const brevoSmtp = () => Boolean(process.env.MARKETING_SMTP_HOST && process.env.MARKETING_SMTP_USER && process.env.MARKETING_SMTP_PASSWORD);
/** E-mails du site (notifications, accusés de réception) : SMTP principal, sinon le serveur des campagnes (Brevo). */
const configured = () => ownSmtp() || brevoSmtp();
const defaultFrom = () =>
  process.env.MAIL_FROM || (ownSmtp() ? `Alsimat <${process.env.SMTP_USER}>` : process.env.MARKETING_MAIL_FROM || "Alsimat <info@alsimat.com>");

let transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter {
  if (!ownSmtp()) return getMarketingTransporter();
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

export async function sendMail(opts: { to: string | string[]; subject: string; text: string; replyTo?: string }) {
  if (!configured()) {
    console.info(`[mail] SMTP non configuré — e-mail non envoyé : ${opts.subject}`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: defaultFrom(),
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
export const marketingConfigured = () => configured();

function getMarketingTransporter(): nodemailer.Transporter {
  if (!brevoSmtp()) {
    if (!ownSmtp()) throw new Error("Aucun serveur d'envoi configuré (SMTP).");
    return getTransporter();
  }
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
  const fromAddr = (opts.marketing && process.env.MARKETING_MAIL_FROM) || defaultFrom();
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

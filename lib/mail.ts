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

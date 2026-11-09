import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { renderEmail } from "./email-template";
import { sendRichMail } from "./mail";
import { getSetting } from "./settings";
import { SITE_URL } from "./site";

export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
const VALID_DAYS = 7;

/** Mot de passe inutilisable tant que la personne n'a pas choisi le sien. */
export const unusablePassword = () => bcrypt.hash(randomBytes(32).toString("hex"), 10);

/**
 * Génère un lien à usage unique (7 jours) et l'envoie par e-mail.
 * Seule l'empreinte du jeton est stockée : une fuite de la base ne donne pas accès aux comptes.
 */
export async function sendAccessLink(userId: string, kind: "invitation" | "reset", invitedBy?: string) {
  const token = randomBytes(32).toString("base64url");
  const user = await db.user.update({
    where: { id: userId },
    data: { resetToken: hashToken(token), resetExpires: new Date(Date.now() + VALID_DAYS * 86400_000) },
  });
  const m = await getSetting("marketing");
  const url = `${SITE_URL}/admin/activation/${token}`;
  const hello = user.name ? `Bonjour ${user.name.split(" ")[0]},` : "Bonjour,";
  const subject = kind === "invitation" ? "Votre accès à l'administration Alsimat" : "Réinitialisation de votre mot de passe Alsimat";
  const body =
    kind === "invitation"
      ? `${hello}\n\n${invitedBy ? `**${invitedBy}** vous a créé` : "Un"} un accès administrateur au site **alsimat.com** (demandes clients, CRM, campagnes, catalogue).\n\nIdentifiant : **${user.email}**\n\nCliquez sur le bouton ci-dessous pour **choisir votre mot de passe**. Le lien est valable ${VALID_DAYS} jours et ne peut servir qu'une fois.\n\nAstuce : une fois connecté, installez l'application sur votre téléphone (Mon compte → Application mobile) pour être alerté de chaque nouvelle demande.`
      : `${hello}\n\nUne réinitialisation du mot de passe a été demandée pour **${user.email}**.\n\nCliquez sur le bouton ci-dessous pour en choisir un nouveau. Le lien est valable ${VALID_DAYS} jours. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`;
  const { html, text } = renderEmail({
    subject, body, ctaLabel: kind === "invitation" ? "Créer mon mot de passe" : "Choisir un nouveau mot de passe", ctaUrl: url,
    merge: {}, senderName: m.senderName, postalAddress: m.postalAddress,
  });
  await sendRichMail({ to: user.email, subject, html, text, fromName: m.senderName });
  return url;
}

/** Utilisateur correspondant à un lien encore valide. */
export async function userForToken(token: string) {
  if (!token || token.length < 20) return null;
  const user = await db.user.findFirst({ where: { resetToken: hashToken(token) } });
  return user && user.resetExpires && user.resetExpires > new Date() ? user : null;
}

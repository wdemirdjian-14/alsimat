/**
 * Crée ou réinitialise un compte administrateur.
 *
 * Usage :
 *   ADMIN_EMAIL="prenom.nom@alsimat.fr" ADMIN_PASSWORD="MotDePasseSolide" yarn create-admin
 * (ou renseigner ces variables dans le fichier .env)
 *
 * - Si le compte existe : son mot de passe est remplacé et son rôle passé à "admin".
 * - Sinon : le compte est créé avec le rôle "admin".
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrateur";

  if (!email || !password) {
    console.error("Erreur : définir ADMIN_EMAIL et ADMIN_PASSWORD.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Erreur : le mot de passe doit contenir au moins 8 caractères.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { hashedPassword, role: "admin" },
    create: { email, hashedPassword, name, role: "admin" },
  });
  console.log(`Compte administrateur prêt : ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

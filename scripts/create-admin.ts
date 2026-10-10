/**
 * Crée un administrateur ou réinitialise son mot de passe.
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] npm run create-admin
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD sont obligatoires.");
  if (password.length < 12) throw new Error("Le mot de passe doit contenir au moins 12 caractères.");
  const hashedPassword = await bcrypt.hash(password, 12);
  const name = process.env.ADMIN_NAME || null;
  await db.user.upsert({
    where: { email },
    update: { hashedPassword, role: "admin", ...(name ? { name } : {}) },
    create: { email, hashedPassword, name, role: "admin" },
  });
  console.log(`Administrateur prêt : ${email}`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

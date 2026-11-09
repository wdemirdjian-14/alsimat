"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendAccessLink, unusablePassword, userForToken } from "@/lib/invitations";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

/** Crée un administrateur et lui envoie le lien pour choisir son mot de passe. */
export async function inviteAdmin(_prev: string | null, fd: FormData): Promise<string | null> {
  const admin = await requireAdmin();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const name = String(fd.get("name") ?? "").trim() || null;
  if (!EMAIL.test(email)) return "Adresse e-mail invalide.";
  if (await db.user.findUnique({ where: { email } })) return "Ce compte existe déjà : utilisez « Renvoyer le lien ».";
  const user = await db.user.create({ data: { email, name, role: "admin", activated: false, hashedPassword: await unusablePassword() } });
  try {
    await sendAccessLink(user.id, "invitation", admin.name || admin.email);
  } catch (e) {
    revalidatePath("/admin/utilisateurs");
    return `Compte créé, mais l'e-mail n'a pas pu partir (${e instanceof Error ? e.message : "erreur d'envoi"}). Réessayez avec « Renvoyer le lien ».`;
  }
  revalidatePath("/admin/utilisateurs");
  return `ok:Invitation envoyée à ${email}.`;
}

export async function resendAccess(userId: string): Promise<string> {
  const admin = await requireAdmin();
  const u = await db.user.findUniqueOrThrow({ where: { id: userId } });
  try {
    await sendAccessLink(u.id, u.activated ? "reset" : "invitation", admin.name || admin.email);
  } catch (e) {
    return e instanceof Error ? e.message : "Échec de l'envoi.";
  }
  revalidatePath("/admin/utilisateurs");
  return "ok";
}

export async function deleteAdmin(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;
  if ((await db.user.count({ where: { role: "admin" } })) <= 1) return;
  await db.user.delete({ where: { id: userId } });
  await db.pushSubscription.deleteMany({ where: { userId } });
  revalidatePath("/admin/utilisateurs");
}

/** Page publique /admin/activation/[jeton] : la personne choisit son mot de passe puis est connectée. */
export async function activateAccount(token: string, _prev: string | null, fd: FormData): Promise<string | null> {
  if (!(await rateLimit("activation", 10, 15 * 60_000))) return "Trop de tentatives. Réessayez dans 15 minutes.";
  const user = await userForToken(token);
  if (!user) return "Ce lien n'est plus valide. Demandez un nouveau lien à un administrateur.";
  const pwd = String(fd.get("password") ?? "");
  if (pwd.length < 12) return "Le mot de passe doit contenir au moins 12 caractères.";
  if (pwd !== fd.get("confirm")) return "Les deux mots de passe ne correspondent pas.";
  await db.user.update({
    where: { id: user.id },
    data: { hashedPassword: await bcrypt.hash(pwd, 12), activated: true, resetToken: null, resetExpires: null, ...(fd.get("name") ? { name: String(fd.get("name")).trim() } : {}) },
  });
  await startSession(user);
  redirect("/admin/compte#application");
}

/** « Mot de passe oublié » : réponse identique que le compte existe ou non. */
export async function requestReset(_prev: string | null, fd: FormData): Promise<string | null> {
  if (!(await rateLimit("reset", 5, 15 * 60_000))) return "Trop de demandes. Réessayez dans 15 minutes.";
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const user = EMAIL.test(email) ? await db.user.findUnique({ where: { email } }) : null;
  if (user?.role === "admin") await sendAccessLink(user.id, user.activated ? "reset" : "invitation").catch((e) => console.error("[reset]", e));
  return "ok";
}

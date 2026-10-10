"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { endSession, requireAdmin, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function login(_prev: string | null, fd: FormData): Promise<string | null> {
  if (!(await rateLimit("login", 8, 15 * 60_000))) return "Trop de tentatives. Réessayez dans 15 minutes.";
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const user = await db.user.findUnique({ where: { email } });
  // Comparaison effectuée même si l'utilisateur n'existe pas (temps de réponse constant).
  const ok = await bcrypt.compare(password, user?.hashedPassword ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva");
  if (!user || !ok || user.role !== "admin") return "Identifiants incorrects.";
  await startSession(user);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function changePassword(_prev: string | null, fd: FormData): Promise<string | null> {
  const user = await requireAdmin();
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  if (!(await bcrypt.compare(current, user.hashedPassword))) return "Mot de passe actuel incorrect.";
  if (next.length < 12) return "Le nouveau mot de passe doit contenir au moins 12 caractères.";
  if (next !== fd.get("confirm")) return "Les deux mots de passe ne correspondent pas.";
  await db.user.update({ where: { id: user.id }, data: { hashedPassword: await bcrypt.hash(next, 12) } });
  return "ok";
}

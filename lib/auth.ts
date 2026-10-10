import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session";

export async function getAdmin() {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.sub } });
  return user?.role === "admin" ? user : null;
}

/** À appeler en tête de chaque page et action d'administration. */
export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export async function startSession(user: { id: string; email: string; name: string | null }) {
  (await cookies()).set(SESSION_COOKIE, await signSession({ sub: user.id, email: user.email, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

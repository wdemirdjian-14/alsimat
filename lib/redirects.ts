import { permanentRedirect } from "next/navigation";
import { db } from "./db";

/** Redirection 301 gérée dans l'admin (à appeler avant un notFound()). */
export async function redirectIfAny(path: string) {
  const clean = "/" + path.replace(/^\/+|\/+$/g, "");
  const r = await db.redirect.findUnique({ where: { from: clean } }).catch(() => null);
  if (r) {
    await db.redirect.update({ where: { id: r.id }, data: { hits: { increment: 1 } } }).catch(() => {});
    permanentRedirect(r.to);
  }
}

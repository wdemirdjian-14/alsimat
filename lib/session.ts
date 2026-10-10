import { SignJWT, jwtVerify } from "jose";

/** Session admin : jeton JWT signé (HS256) dans un cookie httpOnly. Compatible middleware (edge). */
export const SESSION_COOKIE = "alsimat_admin";
export const SESSION_DAYS = 7;

const key = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET manquant ou trop court (32 caractères minimum).");
  return new TextEncoder().encode(secret);
};

export type Session = { sub: string; email: string; name?: string | null };

export async function signSession(s: Session) {
  return new SignJWT({ email: s.email, name: s.name ?? null })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return { sub: payload.sub!, email: String(payload.email), name: (payload.name as string) ?? null };
  } catch {
    return null;
  }
}

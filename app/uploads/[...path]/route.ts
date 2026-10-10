import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { MIME, UPLOAD_DIR, resolveInside } from "@/lib/uploads";

/** Sert les images envoyées depuis l'admin (en production, Nginx peut les servir directement). */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = resolveInside(path.join(UPLOAD_DIR, "public"), (await params).path);
  if (!file) return new Response("Not found", { status: 404 });
  try {
    const [buf, info] = await Promise.all([readFile(file), stat(file)]);
    return new Response(buf, {
      headers: {
        "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Last-Modified": info.mtime.toUTCString(),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

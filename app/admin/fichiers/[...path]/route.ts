import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAdmin } from "@/lib/auth";
import { MIME, UPLOAD_DIR, attachmentLabel, resolveInside } from "@/lib/uploads";

/** Pièces jointes SAV : accessibles uniquement aux administrateurs connectés. */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const file = resolveInside(path.join(UPLOAD_DIR, "private"), (await params).path);
  if (!file) return new Response("Not found", { status: 404 });
  try {
    return new Response(await readFile(file), {
      headers: { "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "private, no-store",
        "Content-Disposition": `${new URL(req.url).searchParams.has("dl") ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(attachmentLabel(file))}`,
        "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

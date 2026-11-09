import { db } from "@/lib/db";

const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

/** Pixel d'ouverture des campagnes. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await db.campaignRecipient.updateMany({ where: { token, openedAt: null }, data: { openedAt: new Date() } }).catch(() => {});
  return new Response(GIF, { headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, max-age=0" } });
}

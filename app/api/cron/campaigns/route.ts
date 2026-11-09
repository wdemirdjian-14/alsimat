import { processCampaigns } from "@/lib/campaign-sender";

export const dynamic = "force-dynamic";

/** Déclenché chaque minute par le cron du VPS (voir README). Protégé par CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  return Response.json(await processCampaigns());
}

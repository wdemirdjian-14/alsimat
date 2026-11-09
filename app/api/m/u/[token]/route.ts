import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { unsubscribeByToken } from "@/lib/unsubscribe";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  await unsubscribeByToken((await params).token).catch(() => null);
  return new Response("OK");
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  return NextResponse.redirect(`${SITE_URL}/desinscription/${(await params).token}`);
}

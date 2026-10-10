export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req?.json?.();
    const name = body?.name ?? '';
    const email = body?.email ?? '';
    const phone = body?.phone ?? null;
    const subject = body?.subject ?? null;
    const message = body?.message ?? '';

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const submission = await prisma.contactSubmission.create({
      data: { name, email, phone, subject, message },
    });

    return NextResponse.json({ success: true, id: submission?.id ?? '' });
  } catch (err: any) {
    console.error("Contact submission error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

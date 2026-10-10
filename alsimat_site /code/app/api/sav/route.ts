export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req?.json?.();
    const serialNumber = body?.serialNumber ?? '';
    const firstName = body?.firstName ?? '';
    const lastName = body?.lastName ?? '';
    const email = body?.email ?? '';
    const phone = body?.phone ?? '';
    const description = body?.description ?? '';
    const files = body?.files ?? [];

    if (!serialNumber || !firstName || !lastName || !email || !phone || !description) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const ticket = await prisma.savTicket.create({
      data: {
        serialNumber,
        firstName,
        lastName,
        email,
        phone,
        description,
        files,
        status: "Nouveau",
      },
    });

    return NextResponse.json({ success: true, id: ticket?.id ?? '' });
  } catch (err: any) {
    console.error("SAV ticket error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

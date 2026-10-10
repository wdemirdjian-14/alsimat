export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });
    return NextResponse.json(vehicles ?? []);
  } catch (err: any) {
    console.error("Vehicles fetch error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

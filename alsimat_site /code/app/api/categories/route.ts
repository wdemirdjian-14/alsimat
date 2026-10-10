export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        vehicles: {
          include: { vehicle: true },
        },
      },
    });
    return NextResponse.json(categories ?? []);
  } catch (err: any) {
    console.error("Categories fetch error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

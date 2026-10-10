export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects ?? []);
  } catch (err: any) {
    console.error("Projects fetch error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

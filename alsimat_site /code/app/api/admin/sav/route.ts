export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const tickets = await prisma.savTicket.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tickets);
}

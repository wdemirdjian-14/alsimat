import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const [vehicles, categories, savTickets, contacts, projects] = await Promise.all([
      prisma.vehicle.count(),
      prisma.category.count(),
      prisma.savTicket.count(),
      prisma.contactSubmission.count(),
      prisma.project.count(),
    ]);

    return NextResponse.json({ vehicles, categories, savTickets, contacts, projects });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

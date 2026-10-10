export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, message, source, vehicleRef, config, totalHt } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Nom, prénom et email sont requis' },
        { status: 400 }
      );
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        message: message || null,
        source: source || null,
        vehicleRef: vehicleRef || null,
        config: config ?? undefined,
        totalHt: typeof totalHt === 'number' ? totalHt : null,
      },
    });

    return NextResponse.json({ success: true, id: quote.id }, { status: 201 });
  } catch (error) {
    console.error('Create quote error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

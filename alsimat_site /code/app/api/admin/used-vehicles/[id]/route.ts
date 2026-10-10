export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, description, price, year, mileage, condition, characteristics, images, sold, featured } = body;
    const item = await prisma.usedVehicle.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        price: price || null,
        year: year || null,
        mileage: mileage || null,
        condition: condition || null,
        characteristics: characteristics ?? {},
        images: Array.isArray(images) ? images : [],
        sold: !!sold,
        featured: !!featured,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Update used vehicle error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    await prisma.usedVehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete used vehicle error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

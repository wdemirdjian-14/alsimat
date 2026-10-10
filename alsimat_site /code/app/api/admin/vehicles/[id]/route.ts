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
    const { name, description, shortDescription, price, characteristics, images, featured, categoryIds } = body;

    // Reset category relations
    await prisma.vehicleCategory.deleteMany({ where: { vehicleId: params.id } });

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        shortDescription: shortDescription || null,
        price: price || null,
        characteristics: characteristics || {},
        images: images || [],
        featured: featured || false,
        categories: {
          create: (categoryIds || []).map((categoryId: string) => ({ categoryId })),
        },
      },
      include: { categories: { include: { category: true } } },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    await prisma.vehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

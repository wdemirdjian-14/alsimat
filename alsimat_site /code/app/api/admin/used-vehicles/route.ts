export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { slugify } from '@/lib/slug';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const items = await prisma.usedVehicle.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, description, price, year, mileage, condition, characteristics, images, sold, featured } = body;
    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }
    let slug = slugify(name);
    const existing = await prisma.usedVehicle.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const item = await prisma.usedVehicle.create({
      data: {
        name,
        slug,
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
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Create used vehicle error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

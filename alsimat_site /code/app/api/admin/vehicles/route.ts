export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categories: { include: { category: true } } },
  });
  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, description, shortDescription, price, characteristics, images, featured, categoryIds } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await prisma.vehicle.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        slug,
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

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

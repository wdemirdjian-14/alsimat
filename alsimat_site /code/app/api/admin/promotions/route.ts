export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const items = await prisma.promotion.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { title, description, image, discount, badge, ctaLabel, ctaLink, active, order } = body;
    if (!title) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }
    const item = await prisma.promotion.create({
      data: {
        title,
        description: description || null,
        image: image || null,
        discount: discount || null,
        badge: badge || null,
        ctaLabel: ctaLabel || null,
        ctaLink: ctaLink || null,
        active: active === undefined ? true : !!active,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Create promotion error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

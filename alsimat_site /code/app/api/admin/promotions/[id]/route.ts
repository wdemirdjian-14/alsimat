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
    const { title, description, image, discount, badge, ctaLabel, ctaLink, active, order } = body;
    const item = await prisma.promotion.update({
      where: { id: params.id },
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
    return NextResponse.json(item);
  } catch (error) {
    console.error('Update promotion error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    await prisma.promotion.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete promotion error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

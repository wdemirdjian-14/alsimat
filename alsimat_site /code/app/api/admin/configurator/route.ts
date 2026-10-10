export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const models = await prisma.configuratorModel.findMany({
    orderBy: { order: 'asc' },
    include: {
      groups: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  });
  return NextResponse.json(models);
}

interface OptionInput { name: string; description?: string | null; priceDelta?: number }
interface GroupInput { name: string; subtitle?: string | null; required?: boolean; options: OptionInput[] }

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, subtitle, basePrice, image, active, order, groups } = body as {
      name: string; subtitle?: string; basePrice?: number; image?: string;
      active?: boolean; order?: number; groups?: GroupInput[];
    };
    if (!name) {
      return NextResponse.json({ error: 'Le nom du modèle est requis' }, { status: 400 });
    }
    const model = await prisma.configuratorModel.create({
      data: {
        name,
        subtitle: subtitle || null,
        basePrice: typeof basePrice === 'number' ? basePrice : 0,
        image: image || null,
        active: active === undefined ? true : !!active,
        order: typeof order === 'number' ? order : 0,
        groups: {
          create: (groups || []).map((g, gi) => ({
            name: g.name,
            subtitle: g.subtitle || null,
            required: !!g.required,
            order: gi,
            options: {
              create: (g.options || []).map((o, oi) => ({
                name: o.name,
                description: o.description || null,
                priceDelta: typeof o.priceDelta === 'number' ? o.priceDelta : 0,
                order: oi,
              })),
            },
          })),
        },
      },
      include: { groups: { include: { options: true } } },
    });
    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    console.error('Create configurator model error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

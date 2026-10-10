export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

interface OptionInput { name: string; description?: string | null; priceDelta?: number }
interface GroupInput { name: string; subtitle?: string | null; required?: boolean; options: OptionInput[] }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, subtitle, basePrice, image, active, order, groups } = body as {
      name: string; subtitle?: string; basePrice?: number; image?: string;
      active?: boolean; order?: number; groups?: GroupInput[];
    };

    // Replace nested groups/options entirely for simplicity.
    await prisma.configGroup.deleteMany({ where: { modelId: params.id } });

    const model = await prisma.configuratorModel.update({
      where: { id: params.id },
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
    return NextResponse.json(model);
  } catch (error) {
    console.error('Update configurator model error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    await prisma.configuratorModel.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete configurator model error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

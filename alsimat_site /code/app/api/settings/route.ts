export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getVisibilityFlags } from '@/lib/settings';

// Public endpoint: visibility flags used by the header/nav.
export async function GET() {
  try {
    const flags = await getVisibilityFlags();
    return NextResponse.json(flags);
  } catch {
    return NextResponse.json({
      realisations: true,
      occasion: true,
      promotions: true,
      configurateur: true,
    });
  }
}

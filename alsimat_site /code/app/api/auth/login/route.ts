import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { message: 'Utilisez /api/auth/callback/credentials pour la connexion' },
    { status: 200 }
  );
}

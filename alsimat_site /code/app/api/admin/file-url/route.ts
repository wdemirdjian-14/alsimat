export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getFileUrl } from '@/lib/s3';

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { cloud_storage_path, contentType } = body;
    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'Chemin manquant' }, { status: 400 });
    }
    const url = await getFileUrl(cloud_storage_path, contentType || 'application/octet-stream', false);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('File URL error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

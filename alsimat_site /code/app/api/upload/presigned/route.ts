export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generatePresignedUploadUrl, getFileUrl } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const body = await req?.json?.();
    const fileName = body?.fileName ?? 'file';
    const contentType = body?.contentType ?? 'application/octet-stream';
    const isPublic = body?.isPublic ?? false;

    const result = await generatePresignedUploadUrl(fileName, contentType, isPublic);

    let publicUrl = '';
    if (isPublic) {
      publicUrl = await getFileUrl(result?.cloud_storage_path ?? '', contentType, true);
    }

    return NextResponse.json({
      uploadUrl: result?.uploadUrl ?? '',
      cloud_storage_path: result?.cloud_storage_path ?? '',
      publicUrl,
    });
  } catch (err: any) {
    console.error("Presigned URL error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

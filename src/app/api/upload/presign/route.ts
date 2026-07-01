import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUpload } from '@/lib/s3';
import { UploadRequestSchema } from '@/lib/validators';

// POST /api/upload/presign — private, middleware-guarded
// Returns a short-lived presigned PUT URL. The browser uploads directly to S3.
// No media bytes ever touch Next.js.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { uploadUrl, objectKey, publicUrl } = await generatePresignedUpload(
      parsed.data.context,
      parsed.data.mimeType,
      parsed.data.fileExtension,
    );

    return NextResponse.json({ uploadUrl, objectKey, publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

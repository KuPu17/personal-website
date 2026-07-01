import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import { getMediaPublicBaseUrl } from '@/lib/env';

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;
const PRESIGNED_URL_TTL = 300; // 5 minutes

export type UploadContext = 'blog' | 'project' | 'journal';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

const MAX_FILE_BYTES: Record<UploadContext, number> = {
  blog: 10 * 1024 * 1024,     // 10 MB
  project: 10 * 1024 * 1024,  // 10 MB
  journal: 50 * 1024 * 1024,  // 50 MB (allows short videos)
};

export type PresignedUploadResult = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
};

// ─── Generate a presigned PUT URL ─────────────────────────────────────────────
export async function generatePresignedUpload(
  context: UploadContext,
  mimeType: string,
  fileExtension: string,
): Promise<PresignedUploadResult> {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`File type "${mimeType}" is not permitted.`);
  }

  const objectKey = `${context}/${nanoid()}${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
    ContentType: mimeType,
    // Enforce max size server-side via content-length condition
    // (client must send Content-Length header matching this)
    Metadata: {
      context,
      uploadedAt: new Date().toISOString(),
    },
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: PRESIGNED_URL_TTL,
    signableHeaders: new Set(['content-type']),
  });

  const region = process.env.AWS_REGION ?? 'us-east-1';
  const mediaBase = getMediaPublicBaseUrl();
  const publicUrl = mediaBase
    ? `${mediaBase}/${objectKey}`
    : `https://${BUCKET}.s3.${region}.amazonaws.com/${objectKey}`;

  return { uploadUrl, objectKey, publicUrl };
}

// ─── Delete an object ─────────────────────────────────────────────────────────
export async function deleteS3Object(objectKey: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: objectKey }));
}

// ─── Extract object key from a full S3 URL ───────────────────────────────────
export function extractObjectKey(url: string): string | null {
  try {
    const u = new URL(url);
    return u.pathname.slice(1); // strip leading /
  } catch {
    return null;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/db';
import { siteVisits } from '@/db/schema';
import { VisitCreateSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

function hashIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
  return createHash('sha256').update(ip + (process.env.JWT_SECRET ?? '')).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = VisitCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await db.insert(siteVisits).values({
    path: parsed.data.path,
    ipHash: hashIp(req),
  });

  return NextResponse.json({ ok: true });
}

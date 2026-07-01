import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { BlogUpdateSchema } from '@/lib/validators';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const [row] = await db.select().from(blogs).where(eq(blogs.id, params.id));
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  const parsed = BlogUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { publishedAt, ...rest } = parsed.data;
  const [row] = await db
    .update(blogs)
    .set({
      ...rest,
      ...(publishedAt !== undefined
        ? { publishedAt: publishedAt ? new Date(publishedAt) : null }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(blogs.id, params.id))
    .returning();
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await db.delete(blogs).where(eq(blogs.id, params.id));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { BlogUpdateSchema } from '@/lib/validators';
import { getDbErrorInfo } from '@/lib/db-safe';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const [row] = await db.select().from(blogs).where(eq(blogs.id, params.id));
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    const info = getDbErrorInfo(err);
    console.error('[BLOG GET id]', info.code, info.message);
    return NextResponse.json(
      { error: 'Could not load blog post.', hint: info.hint },
      { status: 503 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
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
  } catch (err) {
    const info = getDbErrorInfo(err);
    console.error('[BLOG PATCH]', info.code, info.message);
    return NextResponse.json(
      { error: 'Could not update blog post.', hint: info.hint, code: info.code },
      { status: info.code === '42P01' ? 503 : 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await db.delete(blogs).where(eq(blogs.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const info = getDbErrorInfo(err);
    console.error('[BLOG DELETE]', info.code, info.message);
    return NextResponse.json(
      { error: 'Could not delete blog post.', hint: info.hint },
      { status: 500 },
    );
  }
}

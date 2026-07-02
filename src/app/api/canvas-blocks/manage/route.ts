import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { canvasBlocks } from '@/db/schema';
import { asc, sql } from 'drizzle-orm';
import { CanvasBlockCreateSchema } from '@/lib/validators';
import { getDbErrorInfo } from '@/lib/db-safe';

function validationError(parsed: { error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } } }) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  const first =
    Object.entries(fieldErrors).find(([, msgs]) => msgs && msgs.length > 0)?.[1]?.[0] ??
    'Invalid work data';
  return NextResponse.json({ error: first, details: parsed.error.flatten() }, { status: 400 });
}

export async function GET() {
  const rows = await db
    .select()
    .from(canvasBlocks)
    .orderBy(asc(canvasBlocks.spawnOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CanvasBlockCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed);
    }
    const [{ nextOrder }] = await db
      .select({
        nextOrder: sql<number>`coalesce(max(${canvasBlocks.spawnOrder}), -1) + 1`,
      })
      .from(canvasBlocks);

    const [row] = await db
      .insert(canvasBlocks)
      .values({ ...parsed.data, spawnOrder: nextOrder })
      .returning();

    revalidatePath('/works');
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    const info = getDbErrorInfo(err);
    console.error('[CANVAS BLOCKS POST]', info.code, info.message);
    return NextResponse.json(
      { error: 'Could not save work.', hint: info.hint, code: info.code },
      { status: info.code === '42P01' ? 503 : 500 },
    );
  }
}

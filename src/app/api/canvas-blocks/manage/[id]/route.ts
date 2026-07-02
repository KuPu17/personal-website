import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { canvasBlocks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CanvasBlockUpdateSchema } from '@/lib/validators';

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  const parsed = CanvasBlockUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db
    .update(canvasBlocks)
    .set(parsed.data)
    .where(eq(canvasBlocks.id, params.id))
    .returning();
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  revalidatePath('/works');
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await db.delete(canvasBlocks).where(eq(canvasBlocks.id, params.id));
  return NextResponse.json({ ok: true });
}

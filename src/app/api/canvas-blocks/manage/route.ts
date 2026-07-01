import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { canvasBlocks } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { CanvasBlockCreateSchema } from '@/lib/validators';

export async function GET() {
  const rows = await db
    .select()
    .from(canvasBlocks)
    .orderBy(asc(canvasBlocks.spawnOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CanvasBlockCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(canvasBlocks).values(parsed.data).returning();
  return NextResponse.json(row, { status: 201 });
}

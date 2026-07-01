import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

type Params = { params: { id: string } };

// PATCH /api/messages/manage/[id] — mark as read
export async function PATCH(_req: NextRequest, { params }: Params) {
  await db
    .update(messages)
    .set({ isRead: true })
    .where(eq(messages.id, params.id));
  return NextResponse.json({ ok: true });
}

// DELETE /api/messages/manage/[id] — delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  await db.delete(messages).where(eq(messages.id, params.id));
  return NextResponse.json({ ok: true });
}

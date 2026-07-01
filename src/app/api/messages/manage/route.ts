import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/messages/manage — list all messages
export async function GET() {
  const rows = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt));
  return NextResponse.json(rows);
}

// PATCH /api/messages/manage/[id] handled in [id]/route.ts
// DELETE /api/messages/manage/[id] handled in [id]/route.ts

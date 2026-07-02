import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { getDbErrorInfo, isDatabaseConfigured } from '@/lib/db-safe';

export const dynamic = 'force-dynamic';

const REQUIRED_TABLES = ['messages', 'blogs', 'projects', 'canvas_blocks', 'site_settings'];

export async function GET() {
  const payload: Record<string, unknown> = {
    ok: true,
    version: process.env.npm_package_version ?? '0.1.0',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    schema: 'unknown',
  };

  if (!isDatabaseConfigured()) {
    payload.database = 'not_configured';
    return NextResponse.json(payload, { status: 503 });
  }

  try {
    await db.execute(sql`SELECT 1`);
    payload.database = 'connected';
  } catch (err) {
    const info = getDbErrorInfo(err);
    console.error('[HEALTH]', info.code, info.message);
    payload.database = 'error';
    payload.errorCode = info.code;
    payload.errorMessage = info.message;
    payload.hint = info.hint;
    return NextResponse.json(payload, { status: 503 });
  }

  try {
    const rows = await db.execute<{ table_name: string }>(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('messages', 'blogs', 'projects', 'canvas_blocks', 'site_settings')
    `);

    const found = new Set(rows.rows.map((r) => r.table_name));
    const missing = REQUIRED_TABLES.filter((t) => !found.has(t));

    if (missing.length > 0) {
      payload.schema = 'incomplete';
      payload.missingTables = missing;
      payload.hint = 'Run drizzle migrations 0000–0003 against this database.';
      return NextResponse.json(payload, { status: 503 });
    }

    payload.schema = 'ready';
    return NextResponse.json(payload);
  } catch (err) {
    const info = getDbErrorInfo(err);
    console.error('[HEALTH schema]', info.code, info.message);
    payload.schema = 'error';
    payload.errorCode = info.code;
    payload.errorMessage = info.message;
    return NextResponse.json(payload, { status: 503 });
  }
}

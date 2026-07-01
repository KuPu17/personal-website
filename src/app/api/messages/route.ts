import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { MessageCreateSchema } from '@/lib/validators';
import { hashIp, checkRateLimit, isBotSubmission } from '@/lib/rate-limit';
import { isDatabaseConfigured } from '@/lib/db-safe';

// POST /api/messages — public endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = MessageCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid message', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Honeypot — bots fill the hidden `website` field
    if (isBotSubmission(parsed.data.website)) {
      // Silently accept (don't let bots know they were blocked)
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // IP extraction (Cloudfront / Vercel / App Runner headers)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      '0.0.0.0';

    const ipHash = hashIp(ip);
    const rateCheck = checkRateLimit(ipHash);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many messages. Try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Messaging is temporarily unavailable.' },
        { status: 503 },
      );
    }

    await db.insert(messages).values({
      messageText: parsed.data.messageText,
      ipHash,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[MESSAGES POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

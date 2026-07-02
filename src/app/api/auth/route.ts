import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { AuthSchema } from '@/lib/validators';
import { hashIp, checkAuthRateLimit } from '@/lib/rate-limit';
import {
  signToken,
  setSessionCookie,
  clearSessionCookie,
  isAuthBypassed,
  getSessionFromRequest,
} from '@/lib/auth';
import { getOwnerPasscodeHash, isOwnerPasscodeHashValid } from '@/lib/env';

async function verifyPasscode(passcode: string): Promise<boolean> {
  const trimmed = passcode.trim();
  if (!trimmed) return false;

  if (isAuthBypassed()) {
    return true;
  }

  const hash = getOwnerPasscodeHash();
  if (!hash) return false;

  if (!isOwnerPasscodeHashValid()) {
    console.error(
      '[AUTH] OWNER_PASSCODE_HASH is malformed — in .env escape every $ as \\$ (run npm run hash-passcode)',
    );
    return false;
  }

  return bcrypt.compare(trimmed, hash);
}

// GET /api/auth — session check (public)
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  return NextResponse.json({ authenticated: Boolean(session) });
}

// POST /api/auth — verify passcode → issue cookie
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      '0.0.0.0';
    const rate = checkAuthRateLimit(hashIp(ip));
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rate.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const body = await req.json();
    const parsed = AuthSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!isAuthBypassed() && !getOwnerPasscodeHash()) {
      console.error('OWNER_PASSCODE_HASH is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const valid = await verifyPasscode(parsed.data.passcode);

    if (!valid) {
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 100));
      return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 });
    }

    const token = await signToken();
    await setSessionCookie(token);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[AUTH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE /api/auth — logout
export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

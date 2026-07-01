import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = '__webos_session';
const ALGORITHM = 'HS256';
const DEV_JWT_SECRET = 'dev-jwt-secret-local-only';

/** True only when explicitly enabled — never auto-bypass in production. */
export function isAuthBypassed(): boolean {
  if (process.env.AUTH_BYPASS === 'true') return true;
  if (process.env.AUTH_BYPASS === 'false') return false;
  // Development default: any non-empty passcode works for local testing
  return process.env.NODE_ENV !== 'production';
}

function useSecureCookies(): boolean {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? '';
  return url.startsWith('https://');
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      return new TextEncoder().encode(DEV_JWT_SECRET);
    }
    throw new Error('JWT_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export type JWTPayload = {
  sub: 'owner';
  iat: number;
  exp: number;
};

export async function signToken(): Promise<string> {
  return new SignJWT({ sub: 'owner' })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRY ?? '7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(
  req: NextRequest,
): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

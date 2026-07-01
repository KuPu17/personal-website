import { createHash } from 'crypto';

export function hashIp(ip: string): string {
  const salt = process.env.JWT_SECRET ?? 'fallback-salt';
  return createHash('sha256')
    .update(`${salt}:${ip}`)
    .digest('hex')
    .substring(0, 32);
}

type RateEntry = { count: number; resetAt: number };
const ipStore = new Map<string, RateEntry>();

function checkLimit(
  storeKey: string,
  maxPerWindow: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = ipStore.get(storeKey);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    ipStore.set(storeKey, { count: 1, resetAt });
    return { allowed: true, remaining: maxPerWindow - 1, resetAt };
  }

  if (entry.count >= maxPerWindow) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxPerWindow - entry.count,
    resetAt: entry.resetAt,
  };
}

const MESSAGE_WINDOW_MS = 60 * 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 3;

export function checkRateLimit(ipHash: string) {
  return checkLimit(
    `msg:${ipHash}`,
    MAX_MESSAGES_PER_WINDOW,
    MESSAGE_WINDOW_MS,
  );
}

const AUTH_WINDOW_MS = 15 * 60 * 1000;
const MAX_AUTH_ATTEMPTS = 8;

export function checkAuthRateLimit(ipHash: string) {
  return checkLimit(`auth:${ipHash}`, MAX_AUTH_ATTEMPTS, AUTH_WINDOW_MS);
}

export function isBotSubmission(honeypot: string | undefined): boolean {
  return typeof honeypot === 'string' && honeypot.length > 0;
}

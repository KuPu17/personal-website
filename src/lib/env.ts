/**
 * Production environment validation — called from instrumentation.ts at server boot.
 */

const REQUIRED_IN_PRODUCTION = [
  'DATABASE_URL',
  'OWNER_PASSCODE_HASH',
  'JWT_SECRET',
] as const;

const RECOMMENDED_IN_PRODUCTION = [
  'NEXT_PUBLIC_APP_URL',
  'APP_AWS_S3_BUCKET_NAME',
  'APP_AWS_REGION',
] as const;

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const missing = REQUIRED_IN_PRODUCTION.filter(
    (key) => !process.env[key]?.trim(),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`,
    );
  }

  if (process.env.AUTH_BYPASS === 'true') {
    console.warn(
      '[ENV] AUTH_BYPASS=true in production — any passcode will be accepted.',
    );
  }

  const recommended = RECOMMENDED_IN_PRODUCTION.filter(
    (key) => !process.env[key]?.trim(),
  );
  if (recommended.length > 0) {
    console.warn(
      `[ENV] Recommended variables not set: ${recommended.join(', ')}`,
    );
  }

  const dbUrl = process.env.DATABASE_URL ?? '';
  if (
    dbUrl.includes('your-rds-host') ||
    dbUrl.includes('user:password@')
  ) {
    throw new Error('DATABASE_URL still contains placeholder values.');
  }
}

export function getMediaPublicBaseUrl(): string | null {
  const cdn =
    process.env.NEXT_PUBLIC_CLOUDFRONT_URL?.trim() ||
    process.env.NEXT_PUBLIC_MEDIA_URL?.trim();
  return cdn ? cdn.replace(/\/$/, '') : null;
}

/** Bcrypt hashes contain `$` — Next.js dotenv-expand strips bare `$` segments in .env files. */
export function getOwnerPasscodeHash(): string | null {
  const raw = process.env.OWNER_PASSCODE_HASH?.trim();
  if (!raw) return null;

  let hash = raw;
  if (
    (hash.startsWith("'") && hash.endsWith("'")) ||
    (hash.startsWith('"') && hash.endsWith('"'))
  ) {
    hash = hash.slice(1, -1);
  }

  return hash || null;
}

export function isOwnerPasscodeHashValid(): boolean {
  const hash = getOwnerPasscodeHash();
  return Boolean(hash?.startsWith('$2'));
}

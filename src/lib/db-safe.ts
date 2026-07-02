export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? '';
  if (!url.trim()) return false;
  if (url.includes('your-rds-host')) return false;
  if (url.includes('user:password@')) return false;
  return true;
}

type PgError = {
  code?: string;
  message?: string;
};

export function getDbErrorInfo(err: unknown): {
  code: string;
  message: string;
  hint: string | null;
} {
  const pg = err as PgError;
  const code = pg.code ?? 'UNKNOWN';
  const message = pg.message ?? String(err);

  const hints: Record<string, string> = {
    '42P01': 'Database tables are missing — run drizzle migrations (0000–0003).',
    '42703': 'Database column missing — run migration 0002_display_dates.sql.',
    '3D000': 'The database name in DATABASE_URL does not exist.',
    '28P01': 'Invalid database username or password.',
    'ENOTFOUND': 'Database host could not be resolved.',
    'ECONNREFUSED': 'Database refused the connection (security group / public access).',
    'SELF_SIGNED_CERT_IN_CHAIN':
      'RDS SSL cert rejected — use sslmode=no-verify in DATABASE_URL or set rejectUnauthorized: false in db pool.',
  };

  return {
    code,
    message,
    hint: hints[code] ?? null,
  };
}

export async function queryDb<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return await operation();
  } catch (error) {
    console.error('[DB] query failed:', error);
    return fallback;
  }
}

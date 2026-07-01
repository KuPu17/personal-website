export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? '';
  if (!url.trim()) return false;
  if (url.includes('your-rds-host')) return false;
  if (url.includes('user:password@')) return false;
  return true;
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

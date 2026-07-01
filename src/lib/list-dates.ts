const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

export function formatBlogDate(value?: string | Date | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getUTCDate();
  const month = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function formatMonthYear(
  month?: number | null,
  year?: number | null,
): string | null {
  if (!month || !year) return null;
  if (month < 1 || month > 12) return null;
  return `${MONTHS[month - 1]} ${year}`;
}

export function toDateInputValue(value?: string | Date | null): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function isDemoListId(id: string): boolean {
  return id.startsWith('demo-');
}

export const MONTH_OPTIONS = MONTHS.map((label, index) => ({
  value: index + 1,
  label,
}));

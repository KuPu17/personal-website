import { formatBlogDate, formatMonthYear } from '@/lib/list-dates';

type Props = {
  pageType: 'blog' | 'link';
  publishedAt?: string | null;
  displayMonth?: number | null;
  displayYear?: number | null;
};

export default function ListCardDate({
  pageType,
  publishedAt,
  displayMonth,
  displayYear,
}: Props) {
  const label =
    pageType === 'blog'
      ? formatBlogDate(publishedAt)
      : formatMonthYear(displayMonth, displayYear);

  if (!label) return null;

  return <p className="list-card__date">{label}</p>;
}

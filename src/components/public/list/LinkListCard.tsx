'use client';

import ListCardMedia from '@/components/public/list/ListCardMedia';
import ControllerEditButton from '@/components/public/list/ControllerEditButton';
import ListCardDate from '@/components/public/list/ListCardDate';
import { useListController } from '@/components/public/list/ListControllerProvider';
import type { ListCardData } from '@/lib/list-content';

type Props = ListCardData & {
  themeColor: string;
};

export default function LinkListCard({
  id,
  title,
  description,
  imageUrl,
  href,
  themeColor,
  publishedAt,
  displayMonth,
  displayYear,
}: Props) {
  const { startEdit } = useListController();

  if (!href) return null;

  const hasMedia = Boolean(imageUrl);
  const hasDescription = Boolean(description?.trim());
  const hasBody = Boolean(title) || hasDescription;

  return (
    <div className="list-card-wrap">
      <ControllerEditButton itemId={id} onEdit={() => startEdit({
        id,
        title,
        description,
        imageUrl,
        href,
        publishedAt,
        displayMonth,
        displayYear,
      })} />
      <a
        href={href}
        className="list-card list-card--link"
        style={{ '--list-card-bg': themeColor } as React.CSSProperties}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ListCardMedia title={title} imageUrl={imageUrl} />
        {hasBody && (
          <div
            className={`list-card__body${hasMedia ? '' : ' list-card__body--flush-top'}`}
          >
            <ListCardDate
              pageType="link"
              publishedAt={publishedAt}
              displayMonth={displayMonth}
              displayYear={displayYear}
            />
            <h2 className="list-card__heading">{title}</h2>
            {hasDescription && (
              <p className="list-card__description">{description}</p>
            )}
          </div>
        )}
      </a>
    </div>
  );
}

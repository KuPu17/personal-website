'use client';

import LinkListCard from '@/components/public/list/LinkListCard';
import ListControllerProvider from '@/components/public/list/ListControllerProvider';
import type { ListCardData } from '@/lib/list-content';

type Props = {
  items: ListCardData[];
  themeColor: string;
  emptyLabel: string;
  pageType: 'works' | 'projects';
  showDemoNotice?: boolean;
};

export default function LinkListSection({
  items,
  themeColor,
  emptyLabel,
  pageType,
  showDemoNotice = false,
}: Props) {
  return (
    <div className="list-page__stage">
      <div className="list-page__gutter list-page__gutter--spacer" aria-hidden />
      <div className="list-page__cards">
        <ListControllerProvider
          pageType={pageType}
          themeColor={themeColor}
          itemIds={items.map((item) => item.id)}
          showDemoNotice={showDemoNotice}
        >
          {items.length === 0 ? (
            <p className="list-page__empty">{emptyLabel}</p>
          ) : (
            items.map((item) => (
              <LinkListCard key={item.id} {...item} themeColor={themeColor} />
            ))
          )}
        </ListControllerProvider>
      </div>
      <div className="list-page__gutter list-page__gutter--spacer" aria-hidden />
    </div>
  );
}

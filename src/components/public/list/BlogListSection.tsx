'use client';

import { useCallback, useEffect, useState } from 'react';
import BlogListCard from '@/components/public/list/BlogListCard';
import ListControllerProvider from '@/components/public/list/ListControllerProvider';
import type { ListCardData } from '@/lib/list-content';

type Props = {
  items: ListCardData[];
  themeColor: string;
};

function ListGutter({
  dismissible,
  onDismiss,
}: {
  dismissible: boolean;
  onDismiss: () => void;
}) {
  if (dismissible) {
    return (
      <button
        type="button"
        className="list-page__gutter"
        aria-label="Close post"
        onClick={onDismiss}
      />
    );
  }

  return <div className="list-page__gutter list-page__gutter--spacer" aria-hidden />;
}

export default function BlogListSection({ items, themeColor }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isDismissible = expandedId !== null;

  const close = useCallback(() => setExpandedId(null), []);

  useEffect(() => {
    if (!isDismissible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDismissible, close]);

  const cards = (
    <ListControllerProvider
      pageType="blogs"
      themeColor={themeColor}
      itemIds={items.map((item) => item.id)}
    >
      {items.length === 0 ? (
        <p className="list-page__empty">No posts yet.</p>
      ) : (
        items.map((item) => (
          <BlogListCard
            key={item.id}
            {...item}
            themeColor={themeColor}
            expanded={expandedId === item.id}
            onToggle={() =>
              setExpandedId((current) => (current === item.id ? null : item.id))
            }
          />
        ))
      )}
    </ListControllerProvider>
  );

  if (items.length === 0) {
    return (
      <div className="list-page__stage">
        <div className="list-page__gutter list-page__gutter--spacer" aria-hidden />
        <div className="list-page__cards">{cards}</div>
        <div className="list-page__gutter list-page__gutter--spacer" aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={`list-page__stage${isDismissible ? ' list-page__stage--dismissible' : ''}`}
    >
      <ListGutter dismissible={isDismissible} onDismiss={close} />
      <div className="list-page__cards">{cards}</div>
      <ListGutter dismissible={isDismissible} onDismiss={close} />
    </div>
  );
}

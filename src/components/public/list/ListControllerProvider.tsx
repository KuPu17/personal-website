'use client';

import { createContext, useContext, useState } from 'react';
import { useControllerMode } from '@/contexts/ControllerModeContext';
import ControllerComposer, {
  type ControllerPageType,
} from '@/components/public/list/ControllerComposer';
import { isDemoListId } from '@/lib/list-dates';
import type { ListCardData } from '@/lib/list-content';

type ListControllerContextValue = {
  startEdit: (item: ListCardData) => void;
};

const ListControllerContext = createContext<ListControllerContextValue>({
  startEdit: () => {},
});

export function useListController() {
  return useContext(ListControllerContext);
}

type Props = {
  pageType: ControllerPageType;
  themeColor: string;
  itemIds?: string[];
  children: React.ReactNode;
};

export default function ListControllerProvider({
  pageType,
  themeColor,
  itemIds = [],
  children,
}: Props) {
  const { isActive, isLoading } = useControllerMode();
  const [composing, setComposing] = useState(false);
  const [editingItem, setEditingItem] = useState<ListCardData | null>(null);

  const showComposer = composing || editingItem !== null;
  const onlyDemoEntries =
    itemIds.length > 0 && itemIds.every((id) => isDemoListId(id));
  const closeComposer = () => {
    setComposing(false);
    setEditingItem(null);
  };

  return (
    <ListControllerContext.Provider
      value={{ startEdit: (item) => setEditingItem(item) }}
    >
      {isActive && !isLoading && showComposer && (
        <ControllerComposer
          pageType={pageType}
          themeColor={themeColor}
          onClose={closeComposer}
          editItem={editingItem}
        />
      )}
      {isActive && !isLoading && !showComposer && (
        <button
          type="button"
          className="controller-add-btn"
          style={{ '--list-card-bg': themeColor } as React.CSSProperties}
          onClick={() => setComposing(true)}
          aria-label="Add entry"
        >
          +
        </button>
      )}
      {isActive && !isLoading && onlyDemoEntries && (
        <p className="controller-demo-notice">
          Showing demo cards — connect your database to edit existing entries.
        </p>
      )}
      {children}
    </ListControllerContext.Provider>
  );
}

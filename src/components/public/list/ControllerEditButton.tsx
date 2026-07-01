'use client';

import { useControllerMode } from '@/contexts/ControllerModeContext';
import { isDemoListId } from '@/lib/list-dates';

type Props = {
  itemId: string;
  onEdit: () => void;
};

export default function ControllerEditButton({ itemId, onEdit }: Props) {
  const { isActive, isLoading } = useControllerMode();

  if (isLoading || !isActive || isDemoListId(itemId)) return null;

  return (
    <button
      type="button"
      className="controller-edit-btn"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onEdit();
      }}
      aria-label="Edit entry"
    >
      edit
    </button>
  );
}

import clsx from 'clsx';

type Props = {
  className?: string;
  lines?: number;
};

// Single shimmer bar
export function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'h-4 rounded bg-overlay animate-pulse',
        className,
      )}
    />
  );
}

// Multi-line text skeleton
export function SkeletonText({ lines = 3 }: Props) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBar
          key={i}
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

// Card skeleton
export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <SkeletonBar className="w-2/3 h-5" />
      <SkeletonText lines={2} />
      <div className="flex gap-2 pt-1">
        <SkeletonBar className="w-12 h-5" />
        <SkeletonBar className="w-16 h-5" />
        <SkeletonBar className="w-10 h-5" />
      </div>
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow() {
  return (
    <tr className="border-b border-border">
      <td className="px-4 py-3"><SkeletonBar className="w-48" /></td>
      <td className="px-4 py-3"><SkeletonBar className="w-16" /></td>
      <td className="px-4 py-3"><SkeletonBar className="w-24" /></td>
      <td className="px-4 py-3"><SkeletonBar className="w-10 ml-auto" /></td>
    </tr>
  );
}

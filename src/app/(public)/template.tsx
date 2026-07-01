'use client';

export default function PublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="public-page">{children}</div>;
}

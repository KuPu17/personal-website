import Link from 'next/link';

type Props = {
  title: string;
  themeColor: string;
  children: React.ReactNode;
};

export default function ListPageLayout({ title, themeColor, children }: Props) {
  return (
    <div
      className="list-page"
      style={{ '--list-theme': themeColor } as React.CSSProperties}
    >
      <header className="list-page__header">
        <Link href="/" className="list-page__back">
          ← home
        </Link>
        <h1 className="list-page__title">{title}</h1>
      </header>
      {children}
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';

const PAGE_BACKGROUNDS: Record<string, string> = {
  '/': '/bg/new_home.png',
  '/blogs': '/pages/blogs.png',
  '/works': '/pages/works.png',
  '/projects': '/pages/projects.png',
};

export default function FixedBackground() {
  const pathname = usePathname();
  const src = PAGE_BACKGROUNDS[pathname] ?? '/bg/new_home.png';

  return (
    <div
      className="bg-layer"
      style={{ backgroundImage: `url('${src}')` }}
      aria-hidden="true"
    />
  );
}

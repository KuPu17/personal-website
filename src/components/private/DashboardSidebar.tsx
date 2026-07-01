'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '⌘' },
  { href: '/dashboard/canvas', label: 'Works', icon: '▣' },
  { href: '/dashboard/blog', label: 'Blog', icon: '✦' },
  { href: '/dashboard/projects', label: 'Projects', icon: '◈' },
  { href: '/dashboard/journal', label: 'Journal', icon: '◉' },
  { href: '/dashboard/messages', label: 'Messages', icon: '◎' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface border-r border-border flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <p className="text-xs font-mono text-accent tracking-widest uppercase">Command Center</p>
        <p className="text-sm font-semibold text-primary mt-0.5">KP</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active =
            href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors duration-150',
                active
                  ? 'bg-overlay text-primary'
                  : 'text-subtle hover:text-secondary hover:bg-overlay/50',
              )}
            >
              <span className="text-xs w-4 text-center opacity-60">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-subtle hover:text-danger hover:bg-danger/5 transition-colors duration-150"
        >
          <span className="text-xs w-4 text-center opacity-60">⏻</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

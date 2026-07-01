import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-xs font-mono text-accent tracking-widest uppercase mb-4">404</p>
        <h1 className="text-3xl font-semibold text-primary mb-3">Page not found</h1>
        <p className="text-subtle text-sm mb-8">
          This route doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">
          Go home
        </Link>
      </div>
    </div>
  );
}

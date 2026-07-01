'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-secondary min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-xs font-mono text-danger tracking-widest uppercase mb-4">
            Error
          </p>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            Something went wrong
          </h2>
          <p className="text-subtle text-sm mb-8 max-w-xs mx-auto">
            {error.digest ? `Digest: ${error.digest}` : 'An unexpected error occurred.'}
          </p>
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

export default function DbOfflineNotice() {
  return (
    <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <p className="font-medium">Database not connected</p>
      <p className="mt-1 text-amber-100/80 text-xs leading-relaxed">
        Set a real <code className="font-mono">DATABASE_URL</code> in{' '}
        <code className="font-mono">.env</code> (local Postgres or RDS). The dashboard
        UI works with empty data until then.
      </p>
    </div>
  );
}

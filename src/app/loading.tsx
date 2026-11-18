export default function Loading() {
  return (
    <main className="min-h-screen bg-surface-50 px-5 py-10 text-navy-950 sm:px-8" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-10 w-40 rounded-lg bg-surface-200" />
        <div className="mt-10 max-w-2xl space-y-3"><div className="h-4 w-28 rounded bg-accent-100" /><div className="h-10 w-3/4 rounded bg-surface-200" /><div className="h-5 w-full rounded bg-surface-200" /></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-3"><div className="h-32 rounded-xl bg-white ring-1 ring-surface-200" /><div className="h-32 rounded-xl bg-white ring-1 ring-surface-200" /><div className="h-32 rounded-xl bg-white ring-1 ring-surface-200" /></div>
        <p className="mt-6 text-sm text-surface-500">Loading your workspace…</p>
      </div>
    </main>
  );
}

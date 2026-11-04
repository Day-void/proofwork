export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
          ProofWork
        </h1>
        <p className="text-lg text-surface-600 leading-relaxed">
          Verified skills assessment platform. Submit real projects, receive
          AI-assisted and human-verified evaluations, and share verified skill
          reports.
        </p>
        <div className="pt-4">
          <span className="inline-block rounded-full bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700">
            Phase 0 — Foundation verified
          </span>
        </div>
      </div>
    </main>
  );
}

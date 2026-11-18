'use client';

import { useEffect } from 'react';
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <main className="flex min-h-screen items-center justify-center bg-surface-50 px-5 py-12 text-navy-950"><div className="max-w-md text-center"><p className="text-xs font-semibold uppercase tracking-[.16em] text-accent-700">We hit a snag</p><h1 className="mt-3 text-2xl font-semibold">Your work is safe</h1><p className="mt-3 text-sm leading-6 text-surface-600">This page could not finish loading. Try again, or return to your workspace and continue from there.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={reset} className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700">Try again</button><Link href="/" className="rounded-lg border border-surface-300 bg-white px-4 py-2 text-sm font-medium text-navy-800 hover:bg-surface-50">Return home</Link></div></div></main>;
}

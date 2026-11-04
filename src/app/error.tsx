'use client';

import { useEffect } from 'react';

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-navy-900">
          Something went wrong
        </h2>
        <p className="text-surface-600">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-bold text-navy-900">404</h2>
        <h3 className="text-xl font-semibold text-navy-800">Page not found</h3>
        <p className="text-surface-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 transition-colors"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

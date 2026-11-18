import Link from 'next/link';

export default function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-5 py-12 text-center text-navy-950"><div className="max-w-md"><p className="text-6xl font-semibold tracking-tight text-navy-900">404</p><h1 className="mt-3 text-xl font-semibold">That page has moved or does not exist</h1><p className="mt-2 text-sm leading-6 text-surface-600">Try the home page, or sign in to return to your workspace.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700">Return home</Link><Link href="/login" className="rounded-lg border border-surface-300 bg-white px-4 py-2 text-sm font-medium text-navy-800 hover:bg-surface-50">Sign in</Link></div></div></main>;
}

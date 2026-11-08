import Link from "next/link";
import { ArrowUpRight, Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-learners", label: "For learners" },
  { href: "#for-employers", label: "For employers" },
  { href: "#for-assessors", label: "For assessors" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/10 bg-white/95 text-navy-950 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400" aria-label="ProofWork home">
          <span className="grid size-9 place-items-center rounded-xl bg-accent-400 text-navy-950"><ShieldCheck size={20} strokeWidth={2.5} /></span>
          <span className="text-lg font-semibold tracking-tight">proofwork<span className="text-accent-400">.</span></span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {links.map((link) => <a key={link.href} href={link.href} className="text-sm text-navy-700 transition hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">{link.label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-navy-800 hover:bg-navy-50 hover:text-navy-950 sm:inline-flex"><Link href="/login">Log in</Link></Button>
          <Button asChild className="bg-accent-400 text-navy-950 hover:bg-accent-300"><Link href="/register">Create portfolio <ArrowUpRight className="ml-1 size-4" /></Link></Button>
          <details className="relative lg:hidden">
            <summary aria-label="Open navigation menu" className="grid size-10 cursor-pointer list-none place-items-center rounded-lg text-navy-800 hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"><Menu size={20} /></summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-12 flex w-56 flex-col gap-1 rounded-xl border border-surface-200 bg-white p-2 shadow-elevated">
              {links.map((link) => <a key={link.href} href={link.href} className="rounded-lg px-3 py-2.5 text-sm text-navy-700 hover:bg-surface-50 hover:text-navy-950">{link.label}</a>)}
              <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm text-navy-700 hover:bg-surface-50">Log in</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { WorkspaceMenu } from "@/components/dashboard/workspace-menu";

type WorkspaceKind = "learner" | "assessor" | "admin" | "employer";

export function WorkspaceHeader({ kind, label, children }: { kind: WorkspaceKind; label: string; children?: ReactNode }) {
  return <header className="bg-surface-50 px-3 py-3 sm:px-5 sm:py-4"><div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 rounded-2xl border border-surface-200 bg-white px-3 shadow-subtle sm:px-5"><Link href="/" className="shrink-0 font-semibold tracking-tight text-navy-950">proofwork<span className="text-accent-600">.</span></Link><div className="hidden text-sm text-surface-500 lg:block">{label}</div><div className="ml-auto flex items-center gap-2">{children}<WorkspaceMenu kind={kind} /></div></div></header>;
}

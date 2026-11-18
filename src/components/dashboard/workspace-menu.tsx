'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { authClient } from "@/lib/auth/client";

const workspaces = [
  { role: "learner", href: "/dashboard", label: "Learner" },
  { role: "assessor", href: "/assessor", label: "Assessor" },
  { role: "moderator", href: "/assessor", label: "Moderator" },
  { role: "admin", href: "/admin", label: "Admin" },
  { role: "employer", href: "/employer", label: "Employer" },
];

export function WorkspaceMenu({ kind }: { kind: "learner" | "assessor" | "admin" | "employer" }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const role = (user as { role?: string } | null | undefined)?.role ?? "learner";
  const availableWorkspaces = workspaces.filter((workspace) => role === "admin" || workspace.role === role || (role === "moderator" && workspace.role === "assessor"));

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <details className="relative"><summary aria-label="Open workspace menu" className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-surface-50 focus-visible:outline-none"><span className="grid size-8 place-items-center rounded-full bg-accent-100 text-xs font-semibold text-accent-800">{user?.name?.slice(0, 2).toUpperCase() ?? "PW"}</span><span className="hidden text-xs sm:block"><span className="block font-semibold text-navy-900">{user?.name ?? "Your account"}</span><span className="block capitalize text-surface-500">{session ? `${role} workspace` : `${kind} workspace`}</span></span><ChevronDown className="hidden text-surface-400 sm:block" size={14} /><Menu className="text-navy-800 sm:hidden" size={19} aria-hidden="true" /></summary><nav aria-label="Workspace menu" className="absolute right-0 top-12 z-30 flex w-56 flex-col gap-1 rounded-xl border border-surface-200 bg-white p-2 shadow-elevated"><span className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-surface-400">Your workspaces</span>{availableWorkspaces.map((workspace) => <Link key={workspace.role} href={workspace.href} className="rounded-lg px-3 py-2 text-sm capitalize text-surface-600 hover:bg-surface-50 hover:text-navy-900">{workspace.label}</Link>)}<span className="mx-2 my-1 border-t border-surface-200" /><Link href="/" className="rounded-lg px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-navy-900">Public site</Link><button type="button" onClick={signOut} className="rounded-lg px-3 py-2 text-left text-sm text-surface-600 hover:bg-surface-50 hover:text-navy-900">Sign out</button></nav></details>;
}

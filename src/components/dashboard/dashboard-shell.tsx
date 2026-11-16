import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleHelp,
  FileCheck2,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceMenu } from "@/components/dashboard/workspace-menu";

type DashboardKind = "learner" | "assessor" | "admin";
type DashboardItem = { label: string; value: string; note: string; icon: LucideIcon };

const nav: Record<DashboardKind, { label: string; href: string; icon: LucideIcon }[]> = {
  learner: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My projects", href: "/dashboard#projects", icon: BriefcaseBusiness },
    { label: "My reports", href: "/dashboard#reports", icon: FileCheck2 },
  ],
  assessor: [
    { label: "Overview", href: "/assessor", icon: LayoutDashboard },
    { label: "Review queue", href: "/assessor#queue", icon: BookOpenCheck },
    { label: "Review workspace", href: "/assessor#workspace", icon: FileCheck2 },
    { label: "Guidelines", href: "/assessor#guidelines", icon: CircleHelp },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Assessment roles", href: "/admin/roles", icon: BookOpenCheck },
    { label: "Users", href: "/admin#users", icon: Users },
    { label: "Platform health", href: "/admin#health", icon: Activity },
  ],
};

const details: Record<DashboardKind, {
  eyebrow: string;
  title: string;
  subtitle: string;
  primary: string;
  metrics: DashboardItem[];
  heading: string;
}> = {
  learner: {
    eyebrow: "Your workspace",
    title: "Good work starts with a first step.",
    subtitle: "Keep your projects, reviews, and verified reports together in one place.",
    primary: "Explore how it works",
    metrics: [
      { label: "Projects", value: "0", note: "Your work in progress", icon: BriefcaseBusiness },
      { label: "In review", value: "0", note: "Nothing waiting right now", icon: BookOpenCheck },
      { label: "Verified reports", value: "0", note: "Ready to share", icon: FileCheck2 },
    ],
    heading: "Your projects",
  },
  assessor: {
    eyebrow: "Assessor workspace",
    title: "Make good work easier to recognize.",
    subtitle: "Review project evidence against clear rubrics and leave feedback people can use.",
    primary: "View review guidelines",
    metrics: [
      { label: "Assigned to you", value: "0", note: "No active assignments", icon: BookOpenCheck },
      { label: "Submitted", value: "0", note: "Awaiting your review", icon: FileCheck2 },
      { label: "Completed", value: "0", note: "Reviews submitted", icon: CheckCircle2 },
    ],
    heading: "Review queue",
  },
  admin: {
    eyebrow: "Administration",
    title: "A clear view of the platform.",
    subtitle: "Monitor activity and keep the assessment experience consistent for everyone.",
    primary: "Manage assessment roles",
    metrics: [
      { label: "Active learners", value: "—", note: "Platform metrics will appear here", icon: Users },
      { label: "Reviews underway", value: "—", note: "Current assessment activity", icon: BookOpenCheck },
      { label: "Platform status", value: "Ready", note: "Core services configured", icon: Activity },
    ],
    heading: "Recent activity",
  },
};

export function DashboardShell({ kind }: { kind: DashboardKind }) {
  const data = details[kind];
  const ctaHref = kind === "learner" ? "/#how-it-works" : kind === "assessor" ? "/assessor#guidelines" : "/admin/roles";
  const listId = kind === "learner" ? "projects" : kind === "assessor" ? "queue" : "users";

  return (
    <main className="min-h-screen bg-surface-50 text-navy-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-200 bg-white lg:flex">
          <Link href="/" className="flex h-[72px] items-center gap-2.5 border-b border-surface-200 px-6">
            <span className="grid size-9 place-items-center rounded-xl bg-navy-950 text-accent-300"><ShieldCheck size={19} /></span>
            <span className="text-base font-semibold tracking-tight">proofwork<span className="text-accent-600">.</span></span>
          </Link>
          <div className="px-4 pt-7">
            <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-surface-400">Workspace</div>
            <nav aria-label="Workspace navigation" className="space-y-1">
              {nav[kind].map(({ label, href, icon: Icon }, index) => (
                <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${index === 0 ? "bg-navy-50 font-semibold text-navy-900" : "text-surface-600 hover:bg-surface-50 hover:text-navy-900"}`}>
                  <Icon size={17} />{label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="rounded-xl bg-navy-950 p-4 text-white">
              <div className="grid size-8 place-items-center rounded-lg bg-white/10 text-accent-300"><CircleHelp size={16} /></div>
              <div className="mt-3 text-sm font-medium">Need a hand?</div>
              <p className="mt-1 text-xs leading-5 text-white/55">Find guidance for your ProofWork journey.</p>
              <Link href="/#how-it-works" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-300">Visit help center <ArrowRight size={13} /></Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-surface-200 bg-white px-5 sm:px-8">
            <Link href="/" className="flex items-center gap-2 lg:hidden"><ShieldCheck className="text-accent-700" size={20} /><span className="font-semibold">proofwork.</span></Link>
            <div className="hidden text-sm text-surface-500 lg:block">{data.eyebrow}</div>
            <WorkspaceMenu kind={kind} />
          </header>

          <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <Badge variant="secondary" className="mb-4 bg-accent-50 text-accent-800">{data.eyebrow}</Badge>
                <h1 className="text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{data.title}</h1>
                <p className="mt-3 text-sm leading-6 text-surface-600 sm:text-base">{data.subtitle}</p>
              </div>
              <Button asChild className="h-11 shrink-0 bg-navy-900 text-white hover:bg-navy-800">
                <Link href={ctaHref}>{kind === "learner" && <Plus className="mr-1 size-4" />}{data.primary}<ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.metrics.map(({ label, value, note, icon: Icon }) => (
                <article key={label} className="rounded-xl border border-surface-200 bg-white p-5 shadow-subtle">
                  <div className="flex items-start justify-between"><span className="text-sm font-medium text-surface-600">{label}</span><span className="grid size-9 place-items-center rounded-lg bg-surface-50 text-navy-700"><Icon size={17} /></span></div>
                  <div className="mt-5 text-3xl font-semibold tracking-tight">{value}</div>
                  <p className="mt-1 text-xs text-surface-500">{note}</p>
                </article>
              ))}
            </div>

            <section id={listId} className="mt-8 rounded-xl border border-surface-200 bg-white">
              <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 sm:px-6">
                <div><h2 className="font-semibold tracking-tight">{data.heading}</h2><p className="mt-1 text-xs text-surface-500">A focused view of what needs your attention.</p></div>
                <span className="grid size-9 place-items-center rounded-lg bg-surface-50 text-surface-500"><FileCheck2 size={17} /></span>
              </div>
              <div className="px-5 py-12 text-center sm:px-6">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-50 text-accent-700"><CheckCircle2 size={22} /></div>
                <h3 className="mt-4 text-sm font-semibold">You’re all caught up</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-surface-500">{kind === "learner" ? "Your projects and their review progress will appear here." : kind === "assessor" ? "New assignments and submitted reviews will appear here." : "Platform activity and operational updates will appear here."}</p>
                {kind === "learner" && <Button asChild variant="outline" size="sm" className="mt-5"><Link href="/#how-it-works"><Plus className="mr-1.5 size-3.5" /> Get started</Link></Button>}
              </div>
            </section>

            {kind === "assessor" && <section id="workspace" className="mt-5 rounded-xl border border-surface-200 bg-white">
              <div className="border-b border-surface-200 px-5 py-4 sm:px-6"><h2 className="font-semibold tracking-tight">Assessment workspace</h2><p className="mt-1 text-xs text-surface-500">The core areas for an independent project review.</p></div>
              <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">{[{ title: "Project evidence", description: "Review the submission and its supporting materials." }, { title: "Rubric criteria", description: "Evaluate each skill against shared expectations." }, { title: "Written feedback", description: "Record clear reasoning and actionable guidance." }].map((item) => <article key={item.title} className="rounded-lg border border-surface-200 bg-surface-50 p-4"><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1.5 text-xs leading-5 text-surface-600">{item.description}</p></article>)}</div>
              <p className="px-5 pb-5 text-xs text-surface-500 sm:px-6">Individual submissions and scoring controls will be connected during the assessment engine phase.</p>
            </section>}
            {kind === "assessor" && <section id="guidelines" className="mt-5 rounded-xl border border-surface-200 bg-white p-5 sm:p-6"><h2 className="font-semibold tracking-tight">Review guidelines</h2><p className="mt-1 text-sm leading-6 text-surface-600">Assess the submitted evidence against the rubric, explain your reasoning, and keep feedback specific and actionable. Independent human judgment remains central to every review.</p></section>}
            {kind === "admin" && <section id="health" className="mt-5 rounded-xl border border-surface-200 bg-white p-5 sm:p-6"><h2 className="font-semibold tracking-tight">Platform health</h2><p className="mt-1 text-sm leading-6 text-surface-600">Operational metrics will be connected during the administration phase. No live service or user data is shown in this preview.</p></section>}
            {kind === "learner" && <section id="reports" className="mt-5 rounded-xl border border-surface-200 bg-white p-5 sm:p-6"><h2 className="font-semibold tracking-tight">Verified reports</h2><p className="mt-1 text-sm leading-6 text-surface-600">Completed assessment reports will appear here when the review workflow is available.</p></section>}
            <p className="mt-5 text-center text-[11px] text-surface-400">Account data is private to your signed-in session.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

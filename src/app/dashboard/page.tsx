import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { ArrowRight, BriefcaseBusiness, CircleUserRound, ClipboardCheck, FileCheck2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceMenu } from "@/components/dashboard/workspace-menu";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { learnerProject, projectSubmission } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Learner workspace" };

export default async function LearnerDashboardPage() {
  const session = await requireRole(["learner"]);
  if (!db) throw new Error("The learner workspace requires a configured database.");
  const projects = await db.select().from(learnerProject)
    .where(eq(learnerProject.learnerId, session.user.id)).orderBy(desc(learnerProject.updatedAt));
  const submissions = projects.length
    ? await db.select({ projectId: projectSubmission.projectId, status: projectSubmission.status })
      .from(projectSubmission).where(inArray(projectSubmission.projectId, projects.map((project) => project.id)))
    : [];
  const byProject = new Map<string, { drafts: number; submitted: number }>();
  for (const submission of submissions) {
    const counts = byProject.get(submission.projectId) ?? { drafts: 0, submitted: 0 };
    counts[submission.status === "draft" ? "drafts" : "submitted"] += 1;
    byProject.set(submission.projectId, counts);
  }
  const submittedCount = submissions.filter((submission) => submission.status === "submitted").length;

  return (
    <main className="min-h-screen bg-surface-50 text-navy-950">
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-semibold tracking-tight">proofwork<span className="text-accent-600">.</span></Link>
          <nav aria-label="Learner account" className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/assessment"><ClipboardCheck className="mr-1.5 size-4" /> Assessments</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/profile"><CircleUserRound className="mr-1.5 size-4" /> Profile</Link></Button>
            <Button asChild size="sm" className="bg-navy-900 text-white hover:bg-navy-800"><Link href="/dashboard/projects/new"><Plus className="mr-1 size-4" /> New project</Link></Button>
            <WorkspaceMenu kind="learner" />
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-11">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="mb-4 bg-accent-50 text-accent-800">Your workspace</Badge>
          <h1 className="text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Your work, in one place.</h1>
          <p className="mt-3 text-sm leading-6 text-surface-600 sm:text-base">Create a project, document how you made it, and submit evidence for a human skills review.</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[{ label: "Projects", value: projects.length, note: "Pieces of work in your workspace", icon: BriefcaseBusiness }, { label: "Submissions", value: submittedCount, note: "Versions sent for human review", icon: FileCheck2 }, { label: "Drafts", value: submissions.length - submittedCount, note: "Work ready for your next step", icon: ClipboardCheck }].map(({ label, value, note, icon: Icon }) => (
            <article key={label} className="rounded-xl border border-surface-200 bg-white p-4 shadow-subtle sm:p-5"><div className="flex items-start justify-between gap-3"><span className="text-sm font-medium text-surface-600">{label}</span><span className="grid size-8 place-items-center rounded-lg bg-accent-50 text-accent-700"><Icon size={16} /></span></div><div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div><p className="mt-1 text-xs text-surface-500">{note}</p></article>
          ))}
        </div>
        <section id="projects" className="mt-9" aria-labelledby="projects-heading">
          <div className="mb-4 flex items-center justify-between"><div><h2 id="projects-heading" className="text-xl font-semibold tracking-tight">Your projects</h2><p className="mt-1 text-sm text-surface-500">Each project can have multiple immutable submission versions.</p></div></div>
          {projects.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const counts = byProject.get(project.id) ?? { drafts: 0, submitted: 0 };
              return <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group rounded-xl border border-surface-200 bg-white p-5 shadow-subtle transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                <div className="flex items-start justify-between gap-4"><span className="grid size-10 place-items-center rounded-xl bg-accent-50 text-accent-700"><BriefcaseBusiness size={19} /></span><ArrowRight className="mt-1 size-4 text-surface-400 transition group-hover:translate-x-1 group-hover:text-accent-700" /></div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{project.title}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent-700">{project.skillArea}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-surface-600">{project.summary}</p>
                <div className="mt-5 flex gap-2 border-t border-surface-100 pt-4 text-xs text-surface-500"><span>{counts.submitted} submitted</span><span aria-hidden="true">·</span><span>{counts.drafts} draft{counts.drafts === 1 ? "" : "s"}</span></div>
              </Link>;
            })}
          </div> : <div className="rounded-xl border border-dashed border-surface-300 bg-white px-6 py-9 text-center sm:py-10">
            <span className="mx-auto grid size-11 place-items-center rounded-xl bg-accent-50 text-accent-700"><BriefcaseBusiness size={21} /></span>
            <h3 className="mt-3 text-base font-semibold">Start with a project</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-surface-600">Add a real piece of work and the skills you used. You can then prepare a versioned submission with supporting evidence.</p>
            <Button asChild className="mt-4 bg-navy-900 text-white hover:bg-navy-800"><Link href="/dashboard/projects/new"><Plus className="mr-1.5 size-4" /> Create your first project</Link></Button>
          </div>}
        </section>
      </section>
    </main>
  );
}

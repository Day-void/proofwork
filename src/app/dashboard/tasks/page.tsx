import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";
import { LearnerTaskDecisionForms, LearnerTaskResponseForm } from "@/features/employer-tasks/forms";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { employerTask, user } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Employer task invitations" };

export default async function LearnerTasksPage() {
  const session = await requireRole(["learner"]);
  if (!db) return <main className="p-8">The database is not configured.</main>;
  const tasks = await db.select({ task: employerTask, employer: user }).from(employerTask)
    .innerJoin(user, eq(employerTask.employerId, user.id))
    .where(eq(employerTask.learnerId, session.user.id)).orderBy(desc(employerTask.createdAt));
  return <main className="min-h-screen bg-surface-50 text-navy-950"><WorkspaceHeader kind="learner" label="Learner workspace" /><div className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><Link href="/dashboard" className="text-sm font-medium text-accent-800 underline">Back to your workspace</Link><div className="mt-4"><Badge variant="secondary" className="bg-accent-50 text-accent-800">Your opportunities</Badge><h1 className="mt-3 text-3xl font-semibold tracking-tight">Employer tasks</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-surface-600">Review the task and criteria before deciding. You choose whether to accept. Your response and any evidence you share are sent only to the employer who invited you.</p></div>
    {tasks.length ? <div className="mt-7 grid gap-4">{tasks.map(({ task, employer }) => <article key={task.id} className="rounded-xl border border-surface-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-accent-800">{task.skillArea}</p><h2 className="mt-1 text-xl font-semibold">{task.title}</h2><p className="mt-1 text-sm text-surface-500">From {employer.name}{task.dueAt ? ` · Due ${task.dueAt.toLocaleDateString()}` : ""}</p></div><Badge variant="secondary" className="capitalize">{task.status}</Badge></div><div className="mt-4"><h3 className="text-sm font-semibold">Task instructions</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-surface-700">{task.instructions}</p><h3 className="mt-4 text-sm font-semibold">What the employer will look for</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-surface-700">{task.criteria}</p></div>
      {task.status === "invited" && <LearnerTaskDecisionForms taskId={task.id} />}
      {task.status === "accepted" && <LearnerTaskResponseForm taskId={task.id} />}
      {task.learnerResponse && <div className="mt-5 rounded-lg bg-surface-50 p-4"><h3 className="text-sm font-semibold">Your submitted response</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-surface-700">{task.learnerResponse}</p>{task.evidenceUrl && <a href={task.evidenceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-accent-800 underline">Open submitted evidence</a>}</div>}
      {task.status === "declined" && <p className="mt-4 text-sm text-surface-500">You declined this invitation.</p>}{task.employerFeedback && <div className="mt-4 rounded-lg border border-accent-100 bg-accent-50/50 p-4"><h3 className="text-sm font-semibold">Employer feedback</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{task.employerFeedback}</p></div>}</article>)}</div> : <div className="mt-7 rounded-xl border border-dashed border-surface-300 bg-white p-8 text-center"><h2 className="font-semibold">No task invitations yet</h2><p className="mt-2 text-sm text-surface-600">If an employer invites you to a role task, it will appear here. You control whether to accept and what evidence to share.</p><Button asChild variant="outline" className="mt-4"><Link href="/dashboard">Return to your projects</Link></Button></div>}
  </div></main>;
}

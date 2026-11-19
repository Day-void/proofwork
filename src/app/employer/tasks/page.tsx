import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";
import { EmployerTaskFeedbackForm, EmployerTaskInviteForm } from "@/features/employer-tasks/forms";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessmentRole, employerTask, learnerProfile, platformSetting, user, verificationRequest } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Employer tasks" };

export default async function EmployerTasksPage() {
  const session = await requireRole(["employer"]);
  if (!db) return <main className="p-8">The database is not configured.</main>;
  const [discovery] = await db.select({ value: platformSetting.value }).from(platformSetting).where(eq(platformSetting.key, "employer_discovery_enabled")).limit(1);
  const tasks = await db.select({ task: employerTask, learner: user }).from(employerTask)
    .innerJoin(user, eq(employerTask.learnerId, user.id)).where(eq(employerTask.employerId, session.user.id))
    .orderBy(desc(employerTask.createdAt));
  const eligible = discovery?.value === "true" ? await db.select({ profile: learnerProfile, learner: user, roleTitle: assessmentRole.title })
    .from(learnerProfile).innerJoin(user, eq(learnerProfile.userId, user.id))
    .innerJoin(verificationRequest, eq(verificationRequest.learnerId, user.id))
    .innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .where(and(
      eq(learnerProfile.discoverable, true), eq(user.role, "learner"), eq(user.disabled, false),
      eq(verificationRequest.status, "approved"), eq(verificationRequest.discoverable, true),
    )) : [];
  const learners = [...new Map(eligible.map((item) => [item.learner.id, item])).values()];

  return <main className="min-h-screen bg-surface-50 text-navy-950"><WorkspaceHeader kind="employer" label="Employer workspace" /><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><Link href="/employer" className="text-sm font-medium text-accent-800 underline">Back to talent discovery</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><Badge variant="secondary" className="bg-accent-50 text-accent-800">Employer tools</Badge><h1 className="mt-3 text-3xl font-semibold tracking-tight">Role tasks</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-surface-600">Invite a learner who chose to be discoverable, share a short role-related task, and give feedback on their response. Tasks are private to you and that learner.</p></div><Badge variant="outline">{tasks.length} task{tasks.length === 1 ? "" : "s"}</Badge></div>
    {discovery?.value !== "true" ? <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">Employer discovery is paused by an administrator. You can review existing tasks, but cannot invite learners until discovery is enabled.</div> : <section className="mt-7 rounded-xl border border-surface-200 bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Create an invitation</h2>{learners.length ? <EmployerTaskInviteForm learners={learners.map(({ learner, roleTitle }) => ({ id: learner.id, name: learner.name, roleTitle }))} /> : <p className="mt-3 text-sm text-surface-600">No learners are currently discoverable. Learners control whether they appear in this directory.</p>}</section>}
    <section className="mt-9"><h2 className="text-xl font-semibold">Your task invitations</h2>{tasks.length ? <div className="mt-4 grid gap-4">{tasks.map(({ task, learner }) => <article key={task.id} className="rounded-xl border border-surface-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-accent-800">{task.skillArea}</p><h3 className="mt-1 text-lg font-semibold">{task.title}</h3><p className="mt-1 text-sm text-surface-500">For {learner.name}{task.dueAt ? ` · Due ${task.dueAt.toLocaleDateString()}` : ""}</p></div><Badge variant="secondary" className="capitalize">{task.status}</Badge></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-surface-700">{task.instructions}</p><p className="mt-2 text-sm"><strong>Criteria: </strong>{task.criteria}</p>{task.learnerResponse && <div className="mt-4 rounded-lg bg-surface-50 p-4"><h4 className="text-sm font-semibold">Learner response</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-surface-700">{task.learnerResponse}</p>{task.evidenceUrl && <a href={task.evidenceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-accent-800 underline">Open submitted evidence</a>}</div>}{task.status === "submitted" && <EmployerTaskFeedbackForm taskId={task.id} />}{task.employerFeedback && <div className="mt-4 rounded-lg border border-accent-100 bg-accent-50/50 p-4"><h4 className="text-sm font-semibold">Feedback sent</h4><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{task.employerFeedback}</p></div>}</article>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-surface-300 bg-white p-8 text-sm text-surface-600">No tasks yet. When discovery is enabled, choose an opted-in learner above to send a task.</div>}</section>
  </div></main>;
}

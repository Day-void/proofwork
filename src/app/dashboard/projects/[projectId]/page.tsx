import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, FileCheck2, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addEvidenceLink, saveSubmissionDraft, startSubmission, submitSubmission } from "@/features/submissions/actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { learnerProject, projectSubmission, submissionEvidence } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Project submissions" };

export default async function LearnerProjectPage({ params, searchParams }: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ saved?: string; submitted?: string }>;
}) {
  const session = await requireRole(["learner"]);
  if (!db) throw new Error("Project submissions require a configured database.");
  const { projectId } = await params;
  const [project] = await db.select().from(learnerProject)
    .where(and(eq(learnerProject.id, projectId), eq(learnerProject.learnerId, session.user.id))).limit(1);
  if (!project) notFound();
  const versions = await db.select().from(projectSubmission)
    .where(eq(projectSubmission.projectId, project.id)).orderBy(desc(projectSubmission.version));
  const evidence = versions.length
    ? await db.select().from(submissionEvidence).where(eq(submissionEvidence.submissionId, versions[0].id)).orderBy(asc(submissionEvidence.createdAt))
    : [];
  const draft = versions.find((version) => version.status === "draft");
  const query = await searchParams;

  return <main className="min-h-screen bg-surface-50 px-5 py-8 text-navy-950 sm:px-8 sm:py-12">
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-surface-600 transition hover:text-navy-900"><ArrowLeft size={16} /> Back to projects</Link>
      <header className="mt-6 rounded-2xl border border-surface-200 bg-white p-6 shadow-subtle sm:p-8">
        <Badge variant="secondary" className="bg-accent-50 text-accent-800">{project.skillArea}</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{project.title}</h1>
        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-surface-600">{project.summary}</p>
        {query.submitted === "1" && <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-800"><CheckCircle2 size={17} /> Version submitted. It is now locked as an immutable snapshot.</p>}
        {query.saved === "1" && <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800"><CheckCircle2 size={17} /> Draft saved.</p>}
      </header>

      <section className="mt-8" aria-labelledby="submission-heading">
        <div className="mb-4 flex items-end justify-between gap-4"><div><h2 id="submission-heading" className="text-xl font-semibold">Submission versions</h2><p className="mt-1 text-sm text-surface-500">Submitted versions are preserved; later changes start a new version.</p></div>
          {!draft && <form action={startSubmission}><input type="hidden" name="projectId" value={project.id} /><Button type="submit" className="shrink-0 bg-navy-900 text-white hover:bg-navy-800"><Plus className="mr-1.5 size-4" /> New version</Button></form>}
        </div>

        {draft && <article className="rounded-2xl border border-accent-200 bg-white p-5 shadow-subtle sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><Badge variant="secondary" className="bg-amber-50 text-amber-800"><Clock3 className="mr-1 size-3" /> Draft</Badge><h3 className="mt-3 text-lg font-semibold">Version {draft.version}</h3></div><span className="text-xs text-surface-500">Save progress at any time</span></div>
          <form action={saveSubmissionDraft} className="mt-6 space-y-5">
            <input type="hidden" name="submissionId" value={draft.id} />
            <div className="space-y-2"><Label htmlFor="projectDescription">What did you build, and what problem does it solve?</Label><textarea id="projectDescription" name="projectDescription" rows={4} maxLength={5000} defaultValue={draft.projectDescription} placeholder="Describe the product, its intended users, and the problem it addresses." className="flex w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm leading-6 text-navy-950 shadow-sm outline-none placeholder:text-surface-400 focus-visible:ring-2 focus-visible:ring-accent-500" /></div>
            <div className="space-y-2"><Label htmlFor="process">How did you approach the work?</Label><textarea id="process" name="process" rows={4} maxLength={5000} defaultValue={draft.process} placeholder="Explain your key decisions, tools, iterations, and trade-offs." className="flex w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm leading-6 text-navy-950 shadow-sm outline-none placeholder:text-surface-400 focus-visible:ring-2 focus-visible:ring-accent-500" /></div>
            <div className="space-y-2"><Label htmlFor="outcomes">What was the result, and what would you improve?</Label><textarea id="outcomes" name="outcomes" rows={3} maxLength={3000} defaultValue={draft.outcomes} placeholder="Share what worked, what you learned, and what you would change next." className="flex w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm leading-6 text-navy-950 shadow-sm outline-none placeholder:text-surface-400 focus-visible:ring-2 focus-visible:ring-accent-500" /></div>
            <div className="space-y-3 rounded-xl bg-surface-50 p-4 text-sm leading-5 text-surface-700">
              <label className="flex items-start gap-3"><input type="checkbox" name="consentRecorded" required className="mt-1 size-4 accent-teal-600" /><span>I consent to this project being reviewed by ProofWork assessors and understand the evidence will be used to prepare feedback.</span></label>
              <label className="flex items-start gap-3"><input type="checkbox" name="integrityConfirmed" required className="mt-1 size-4 accent-teal-600" /><span>I confirm this submission represents my work, and I have permission to share the materials linked as evidence.</span></label>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-surface-100 pt-5 sm:flex-row sm:justify-end"><Button type="submit" formNoValidate variant="outline">Save draft</Button><Button type="submit" formAction={submitSubmission} className="bg-accent-400 font-semibold text-navy-950 hover:bg-accent-300"><FileCheck2 className="mr-1.5 size-4" /> Submit for review</Button></div>
            <p className="text-xs leading-5 text-surface-500">Submission requires complete project details, at least one evidence link, your consent, and confirmation that this work is yours.</p>
          </form>

          <div className="mt-7 border-t border-surface-100 pt-6">
            <h4 className="font-semibold">Evidence links</h4><p className="mt-1 text-sm text-surface-500">Add a live project, repository, demo, or other work sample.</p>
            {versions.length > 0 && evidence.length > 0 && <ul className="mt-4 space-y-2">{evidence.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-50 px-3 py-2.5"><span className="min-w-0"><span className="block truncate text-sm font-medium">{item.title}</span><a href={item.url ?? "#"} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 truncate text-xs text-accent-700 hover:text-accent-800">{item.url}<ArrowUpRight size={12} /></a></span><Badge variant="outline">Link</Badge></li>)}</ul>}
            <form action={addEvidenceLink} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end"><input type="hidden" name="submissionId" value={draft.id} /><div className="space-y-2"><Label htmlFor="evidenceTitle">Evidence title</Label><Input id="evidenceTitle" name="title" minLength={2} maxLength={100} required placeholder="Source code repository" /></div><div className="space-y-2"><Label htmlFor="evidenceUrl">URL</Label><Input id="evidenceUrl" name="url" type="url" required placeholder="https://github.com/you/project" /></div><Button type="submit" variant="outline">Add link</Button></form>
          </div>
        </article>}

        {!draft && versions.length === 0 && <div className="rounded-xl border border-dashed border-surface-300 bg-white px-6 py-10 text-center"><div className="mx-auto grid size-11 place-items-center rounded-xl bg-accent-50 text-accent-700"><FileCheck2 size={20} /></div><h3 className="mt-3 font-semibold">No submissions yet</h3><p className="mt-1 text-sm text-surface-500">Start your first version when you’re ready to document your work.</p></div>}
        {versions.filter((version) => version.status === "submitted").length > 0 && <div className="mt-4 space-y-3">{versions.filter((version) => version.status === "submitted").map((version) => <article key={version.id} className="rounded-xl border border-surface-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-wide text-surface-500">Version {version.version}</div><h3 className="mt-1 font-semibold">Submitted for review</h3></div><Badge variant="secondary" className="bg-accent-50 text-accent-800"><CheckCircle2 className="mr-1 size-3" /> Submitted</Badge></div><p className="mt-3 text-sm leading-6 text-surface-600">{version.projectDescription}</p><p className="mt-3 text-xs text-surface-500">{version.submittedAt ? `Submitted ${version.submittedAt.toLocaleDateString()}` : "Submission date unavailable"}</p></article>)}</div>}
      </section>
    </div>
  </main>;
}

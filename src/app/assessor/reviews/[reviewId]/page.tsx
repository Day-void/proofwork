import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";
import { Button } from "@/components/ui/button";
import { saveAssessmentDraft, submitAssessmentReview } from "@/features/assessment/workflow-actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessorReview, assessmentRole, challengeEvidence, challengeSubmission, competencyRating, learnerProject, projectSubmission, rubricCriterion, rubricVersion, submissionEvidence, verificationRequest } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Evidence review" };

export default async function EvidenceReviewPage({ params, searchParams }: {
  params: Promise<{ reviewId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await requireRole(["assessor"]);
  if (!db) throw new Error("Assessment reviews require a configured database.");
  const { reviewId } = await params;
  const [data] = await db.select({ review: assessorReview, request: verificationRequest, role: assessmentRole, rubric: rubricVersion })
    .from(assessorReview).innerJoin(verificationRequest, eq(assessorReview.requestId, verificationRequest.id))
    .innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .innerJoin(rubricVersion, eq(verificationRequest.rubricVersionId, rubricVersion.id))
    .where(and(eq(assessorReview.id, reviewId), eq(assessorReview.assessorId, session.user.id))).limit(1);
  if (!data || data.review.conflictStatus !== "cleared") notFound();
  if (data.review.status === "submitted") redirect("/assessor?reviewSubmitted=1");
  if (data.review.status !== "in_progress") notFound();
  const [portfolio] = await db.select({ submission: projectSubmission, project: learnerProject }).from(projectSubmission)
    .innerJoin(learnerProject, eq(projectSubmission.projectId, learnerProject.id))
    .where(eq(projectSubmission.id, data.request.portfolioSubmissionId)).limit(1);
  const portfolioEvidence = await db.select().from(submissionEvidence)
    .where(eq(submissionEvidence.submissionId, data.request.portfolioSubmissionId)).orderBy(asc(submissionEvidence.createdAt));
  const [challenge] = await db.select({ submission: challengeSubmission }).from(challengeSubmission)
    .where(eq(challengeSubmission.id, data.request.challengeSubmissionId)).limit(1);
  const challengeMaterials = await db.select().from(challengeEvidence)
    .where(eq(challengeEvidence.challengeSubmissionId, data.request.challengeSubmissionId)).orderBy(asc(challengeEvidence.createdAt));
  const criteria = await db.select().from(rubricCriterion).where(eq(rubricCriterion.rubricVersionId, data.request.rubricVersionId)).orderBy(asc(rubricCriterion.sortOrder));
  const savedRatings = await db.select().from(competencyRating).where(eq(competencyRating.reviewId, reviewId));
  const ratingByCriterion = new Map(savedRatings.map((item) => [item.criterionId, item]));
  const query = await searchParams;
  const portfolioOptions = [{ value: "portfolio:narrative", label: "Portfolio submission narrative" }, ...portfolioEvidence.map((item) => ({ value: `portfolio:${item.id}`, label: `Portfolio: ${item.title} — ${item.url ?? "file"}` }))];
  const challengeOptions = [
    { value: "challenge:response", label: "Challenge response" },
    ...(challenge?.submission.sourceUrl ? [{ value: "challenge:source", label: `Challenge source code — ${challenge.submission.sourceUrl}` }] : []),
    ...(challenge?.submission.demoUrl ? [{ value: "challenge:demo", label: `Challenge demo — ${challenge.submission.demoUrl}` }] : []),
    ...challengeMaterials.map((item) => ({ value: `challenge:${item.id}`, label: `Challenge: ${item.title} — ${item.url ?? "file"}` })),
  ];
  const evidenceOptions = [...portfolioOptions, ...challengeOptions];
  return <main className="min-h-screen bg-surface-50 text-navy-950"><WorkspaceHeader kind="assessor" label="Assessor workspace" /><div className="mx-auto max-w-6xl px-5 py-9 sm:px-8">
    <Link href="/assessor" className="inline-flex items-center gap-2 text-sm text-surface-600"><ArrowLeft size={16} /> Assessor workspace</Link>
    <header className="mt-5 rounded-xl border border-surface-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge variant="secondary" className="bg-accent-50 text-accent-800">{data.role.title} · {data.role.targetLevel}</Badge><h1 className="mt-3 text-2xl font-semibold tracking-tight">Independent evidence review</h1><p className="mt-1 text-sm text-surface-500">Rubric: {data.rubric.title}. Evaluate the portfolio and challenge separately, and link each rating to specific evidence.</p></div><StatusBadge status={data.review.status} /></div></header>
    {query.saved === "1" && <p role="status" className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Review draft saved.</p>}
    <div className="mt-5 grid gap-4 lg:grid-cols-2"><section className="rounded-xl border border-surface-200 bg-white p-5"><h2 className="font-semibold">Portfolio evidence</h2><p className="mt-2 text-sm font-medium">{portfolio?.project.title ?? "Project"}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-surface-600">{portfolio?.submission.projectDescription}</p><h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-surface-500">Process</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-surface-600">{portfolio?.submission.process}</p><h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-surface-500">Outcome</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-surface-600">{portfolio?.submission.outcomes}</p><ul className="mt-4 space-y-2">{portfolioEvidence.map((item) => <li key={item.id}><a href={item.url ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-accent-800 underline">{item.title}<ExternalLink size={13} /></a></li>)}</ul></section>
      <section className="rounded-xl border border-surface-200 bg-white p-5"><h2 className="font-semibold">Role challenge</h2><p className="mt-2 text-sm font-medium">{challenge?.submission.response ? "Learner response" : "Challenge response not provided"}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-surface-600">{challenge?.submission.response}</p>{challenge?.submission.assistanceDisclosure && <p className="mt-4 text-xs leading-5 text-surface-500"><strong>Assistance disclosure:</strong> {challenge.submission.assistanceDisclosure}</p>}{challenge?.submission.sourceUrl && <a href={challenge.submission.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-accent-800 underline">Source code<ExternalLink size={13} /></a>}{challenge?.submission.demoUrl && <a href={challenge.submission.demoUrl} target="_blank" rel="noreferrer" className="ml-4 inline-flex items-center gap-1 text-sm text-accent-800 underline">Live demo<ExternalLink size={13} /></a>}<ul className="mt-4 space-y-2">{challengeMaterials.map((item) => <li key={item.id}><a href={item.url ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-accent-800 underline">{item.title}<ExternalLink size={13} /></a></li>)}</ul></section></div>
    <form className="mt-6 space-y-4"><input type="hidden" name="reviewId" value={reviewId} />{criteria.map((criterion) => { const rating = ratingByCriterion.get(criterion.id); return <fieldset key={criterion.id} className="rounded-xl border border-surface-200 bg-white p-5"><legend className="px-1 text-base font-semibold">{criterion.sortOrder}. {criterion.title}</legend><p className="mt-2 text-sm leading-6 text-surface-600">{criterion.description}</p><p className="mt-2 text-xs leading-5 text-surface-500">Evidence guidance: {criterion.evidenceGuidance}</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{(["not_yet_demonstrated", "developing", "meets_expectations", "strong", "insufficient_evidence"] as const).map((value) => <label key={value} className="flex items-center gap-2 rounded-md border border-surface-200 p-2.5 text-xs has-[:checked]:border-accent-600 has-[:checked]:bg-accent-50"><input type="radio" name={`rating:${criterion.id}`} value={value} defaultChecked={rating?.rating === value} required className="accent-teal-700" /><span>{value.replaceAll("_", " ")}</span></label>)}</div><label className="mt-4 block text-sm font-medium">Evidence reference<select name={`evidence:${criterion.id}`} required defaultValue={rating?.evidenceReference ?? ""} className="mt-1.5 min-h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm"><option value="" disabled>Select the strongest supporting source</option>{evidenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="mt-4 block text-sm font-medium">Rationale<textarea name={`rationale:${criterion.id}`} required minLength={20} maxLength={2000} defaultValue={rating?.rationale ?? ""} className="mt-1.5 min-h-24 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="Describe the observed evidence, how it maps to the anchor, and any limitation." /></label><div className="mt-3 grid gap-2 sm:grid-cols-3"><div className="rounded-md bg-surface-50 p-3 text-xs leading-5"><strong>Developing</strong><p>{criterion.developingAnchor}</p></div><div className="rounded-md bg-surface-50 p-3 text-xs leading-5"><strong>Meets</strong><p>{criterion.meetsAnchor}</p></div><div className="rounded-md bg-surface-50 p-3 text-xs leading-5"><strong>Strong</strong><p>{criterion.strongAnchor}</p></div></div></fieldset>; })}
      <div className="flex flex-wrap justify-end gap-3"><Button formAction={saveAssessmentDraft} formNoValidate variant="outline">Save draft</Button><Button formAction={submitAssessmentReview} className="bg-navy-900 text-white hover:bg-navy-800">Submit independent review</Button></div>
    </form>
  </div></main>;
}

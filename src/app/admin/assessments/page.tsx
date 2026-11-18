import type { Metadata } from "next";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { assignAssessor, reviewCalibration } from "@/features/assessment/workflow-actions";
import { finalizeVerification, revokeVerificationReport } from "@/features/assessment/moderation-actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { aiAnalysisJob, assessorCalibration, assessorReview, assessmentRole, competencyRating, rubricCriterion, rubricVersion, user, verificationRequest } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Assessment operations" };

export default async function AssessmentOperationsPage() {
  const session = await requireRole(["admin", "moderator"]);
  if (!db) return <main className="min-h-screen bg-surface-50 p-8"><h1 className="text-2xl font-semibold">Assessment operations</h1><p className="mt-2 text-sm text-surface-600">The database is not configured.</p></main>;

  const calibrations = await db.select({ calibration: assessorCalibration, assessorName: user.name, assessorEmail: user.email, rubricTitle: rubricVersion.title })
    .from(assessorCalibration).innerJoin(user, eq(assessorCalibration.assessorId, user.id))
    .innerJoin(rubricVersion, eq(assessorCalibration.rubricVersionId, rubricVersion.id))
    .where(eq(assessorCalibration.status, "submitted")).orderBy(asc(assessorCalibration.submittedAt));
  const requests = await db.select({ request: verificationRequest, roleTitle: assessmentRole.title, rubricTitle: rubricVersion.title })
    .from(verificationRequest).innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .innerJoin(rubricVersion, eq(verificationRequest.rubricVersionId, rubricVersion.id))
    .where(eq(verificationRequest.status, "submitted"));
  const decisionRequests = await db.select({ request: verificationRequest, roleTitle: assessmentRole.title, rubricTitle: rubricVersion.title })
    .from(verificationRequest).innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .innerJoin(rubricVersion, eq(verificationRequest.rubricVersionId, rubricVersion.id))
    .where(inArray(verificationRequest.status, ["in_review", "moderation", "appealed"]));
  const approvedRequests = await db.select({ request: verificationRequest, roleTitle: assessmentRole.title })
    .from(verificationRequest).innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .where(eq(verificationRequest.status, "approved"));
  const decisionRows = await Promise.all(decisionRequests.map(async ({ request, roleTitle, rubricTitle }) => {
    const reviews = await db!.select({ review: assessorReview, assessorName: user.name }).from(assessorReview)
      .innerJoin(user, eq(assessorReview.assessorId, user.id))
      .where(and(eq(assessorReview.requestId, request.id), eq(assessorReview.status, "submitted")));
    const reviewDetails = await Promise.all(reviews.map(async ({ review, assessorName }) => ({
      review,
      assessorName,
      ratings: await db!.select({ rating: competencyRating, criterionTitle: rubricCriterion.title }).from(competencyRating)
        .innerJoin(rubricCriterion, eq(competencyRating.criterionId, rubricCriterion.id))
        .where(eq(competencyRating.reviewId, review.id)),
    })));
    const [aiJob] = await db!.select().from(aiAnalysisJob).where(eq(aiAnalysisJob.requestId, request.id)).limit(1);
    return { request, roleTitle, rubricTitle, reviews: reviewDetails, aiJob };
  }));
  const assignmentRows = await Promise.all(requests.map(async ({ request, roleTitle, rubricTitle }) => {
    const [rubric] = await db!.select({ status: rubricVersion.status }).from(rubricVersion).where(eq(rubricVersion.id, request.rubricVersionId)).limit(1);
    const reviews = await db!.select({ review: assessorReview, assessorName: user.name }).from(assessorReview)
      .innerJoin(user, eq(assessorReview.assessorId, user.id)).where(eq(assessorReview.requestId, request.id));
    const eligible = await db!.select({ id: user.id, name: user.name, email: user.email }).from(assessorCalibration)
      .innerJoin(user, eq(assessorCalibration.assessorId, user.id))
      .where(and(eq(assessorCalibration.rubricVersionId, request.rubricVersionId), eq(assessorCalibration.status, "approved"), eq(user.role, "assessor")));
    return { request, roleTitle, rubricTitle, rubricStatus: rubric?.status, reviews, eligible: eligible.filter((assessor) => assessor.id !== request.learnerId) };
  }));

  return <main className="min-h-screen bg-surface-50 text-navy-950"><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <Badge variant="secondary" className="bg-accent-50 text-accent-800">Assessment operations</Badge><h1 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Calibration and assignments</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-surface-600">Review assessor calibration against each published rubric, then assign calibrated assessors to submitted verification requests.</p>
    <section className="mt-8 rounded-xl border border-surface-200 bg-white"><header className="border-b border-surface-200 px-5 py-4"><h2 className="font-semibold">Calibration submissions</h2><p className="mt-1 text-xs text-surface-500">A reviewer approves calibration before an assessor can receive matching work.</p></header>
      {calibrations.length === 0 ? <p className="p-6 text-sm text-surface-500">No calibration submissions are waiting for review.</p> : <div className="divide-y divide-surface-200">{calibrations.map(({ calibration, assessorName, assessorEmail, rubricTitle }) => <article key={calibration.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{assessorName}</h3><p className="mt-1 text-xs text-surface-500">{assessorEmail} · {rubricTitle}</p></div><Badge variant="secondary">Submitted</Badge></div>
        <div className="mt-4 space-y-2">{calibration.answers.map((answer) => <div key={answer.criterionId} className="rounded-md bg-surface-50 p-3 text-xs"><span className="font-semibold">{answer.rating.replaceAll("_", " ")}</span><p className="mt-1 leading-5 text-surface-600">{answer.rationale}</p></div>)}</div>
        {calibration.assessorNote && <p className="mt-3 text-sm text-surface-600"><span className="font-medium">Assessor note:</span> {calibration.assessorNote}</p>}
        <form action={reviewCalibration} className="mt-4 grid gap-3 rounded-lg border border-surface-200 p-4 sm:grid-cols-[1fr_auto_auto]"><input type="hidden" name="calibrationId" value={calibration.id} /><label className="text-sm font-medium">Reviewer note<textarea name="reviewerNote" required minLength={10} maxLength={2000} className="mt-1.5 min-h-20 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="Explain what was aligned or what to calibrate further." /></label><Button name="decision" value="approved" type="submit" className="self-end bg-emerald-700 text-white hover:bg-emerald-800">Approve</Button><Button name="decision" value="revision_requested" type="submit" variant="outline" className="self-end">Request revision</Button></form>
      </article>)}</div>}
    </section>
    <section className="mt-6 rounded-xl border border-surface-200 bg-white"><header className="border-b border-surface-200 px-5 py-4"><h2 className="font-semibold">Submitted verification requests</h2><p className="mt-1 text-xs text-surface-500">Assignments remain pending until the assessor records a conflict disclosure.</p></header>
      {assignmentRows.length === 0 ? <p className="p-6 text-sm text-surface-500">No submitted requests are waiting for an assessor.</p> : <div className="divide-y divide-surface-200">{assignmentRows.map(({ request, roleTitle, rubricTitle, rubricStatus, reviews, eligible }) => <article key={request.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{roleTitle}</h3><p className="mt-1 text-xs text-surface-500">Request {request.id} · {rubricTitle}</p></div><Badge variant="secondary">{reviews.length ? "Assigned" : "Awaiting assignment"}</Badge></div>
        {reviews.length > 0 && <ul className="mt-3 space-y-2 text-sm">{reviews.map(({ review, assessorName }) => <li key={review.id} className="flex flex-wrap items-center gap-2"><span>{assessorName}</span><StatusBadge status={review.status} /><StatusBadge status={review.conflictStatus} />{review.conflictReason && <span className="text-xs text-surface-500">{review.conflictReason}</span>}</li>)}</ul>}
        {eligible.length > 0 && session.user.role === "admin" && <form action={assignAssessor} className="mt-4 flex flex-col gap-2 sm:flex-row"><input type="hidden" name="requestId" value={request.id} /><label className="sr-only" htmlFor={`assessor-${request.id}`}>Assign assessor</label><select id={`assessor-${request.id}`} name="assessorId" required className="min-h-10 flex-1 rounded-lg border border-surface-200 bg-white px-3 text-sm">{eligible.map((assessor) => <option key={assessor.id} value={assessor.id}>{assessor.name} · {assessor.email}</option>)}</select><Button type="submit" className="bg-navy-900 text-white hover:bg-navy-800">Assign assessor</Button></form>}
        {eligible.length === 0 && <p className="mt-4 text-xs text-amber-800">No assessor has approved calibration for this rubric version{rubricStatus !== "published" ? ` (rubric is ${rubricStatus})` : ""}.</p>}
      </article>)}</div>}
    </section>
    <section className="mt-6 rounded-xl border border-surface-200 bg-white"><header className="border-b border-surface-200 px-5 py-4"><h2 className="font-semibold">Moderation and final decisions</h2><p className="mt-1 text-xs text-surface-500">A rating gap of two or more levels on any competency flags the request for moderation. Every approval remains a human decision.</p></header>
      {decisionRows.length === 0 ? <p className="p-6 text-sm text-surface-500">No requests are ready for moderation or a final decision.</p> : <div className="divide-y divide-surface-200">{decisionRows.map(({ request, roleTitle, rubricTitle, reviews, aiJob }) => <article key={request.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{roleTitle}</h3><p className="mt-1 text-xs text-surface-500">{rubricTitle} · Request {request.id}</p></div><StatusBadge status={request.status} /></div>
        {aiJob && <details className="mt-4 rounded-lg border border-blue-100 bg-blue-50/40 p-4"><summary className="cursor-pointer text-sm font-semibold">Optional AI assistance · {aiJob.status}</summary>{aiJob.result && <div className="mt-3 space-y-3 text-sm"><p className="leading-6">{String(aiJob.result.summary ?? "")}</p>{Array.isArray(aiJob.result.evidenceGaps) && <ul className="list-disc space-y-1 pl-5 text-xs">{aiJob.result.evidenceGaps.map((gap, index) => <li key={index}>{String(gap)}</li>)}</ul>}{Array.isArray(aiJob.result.limitations) && <p className="text-xs text-surface-600">Limitations: {aiJob.result.limitations.map(String).join(" · ")}</p>}</div>}{aiJob.lastError && <p className="mt-2 text-xs text-red-700">{aiJob.lastError}</p>}<p className="mt-2 text-[11px] text-surface-500">AI output is advisory, may be wrong, and must not determine the outcome.</p></details>}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">{reviews.map(({ review, assessorName, ratings }) => <div key={review.id} className="rounded-lg border border-surface-200 p-4"><h4 className="text-sm font-semibold">{assessorName}&apos;s submitted assessment</h4>{review.summary && <p className="mt-2 text-sm text-surface-600">{review.summary}</p>}<ul className="mt-3 space-y-2">{ratings.map(({ rating, criterionTitle }) => <li key={rating.id} className="rounded-md bg-surface-50 p-3 text-xs"><strong>{criterionTitle}: {rating.rating.replaceAll("_", " ")}</strong><p className="mt-1 leading-5 text-surface-600">{rating.rationale}</p><p className="mt-1 text-surface-500">Evidence reference: {rating.evidenceReference}</p></li>)}</ul></div>)}</div>
        {request.decisionNote && <p className="mt-4 whitespace-pre-wrap rounded-md bg-surface-50 p-3 text-xs leading-5 text-surface-600">Previous decision or appeal: {request.decisionNote}</p>}
        {reviews.length > 0 && <form action={finalizeVerification} className="mt-4 grid gap-3 rounded-lg border border-surface-200 p-4 sm:grid-cols-[1fr_auto_auto_auto]"><input type="hidden" name="requestId" value={request.id} /><label className="text-sm font-medium">Decision rationale<textarea name="note" required minLength={20} maxLength={3000} className="mt-1.5 min-h-20 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="Summarize the evidence and why this outcome follows." /></label><Button type="submit" name="decision" value="approved" className="self-end bg-emerald-700 text-white hover:bg-emerald-800">Approve</Button><Button type="submit" name="decision" value="needs_more_evidence" variant="outline" className="self-end">Request evidence</Button><Button type="submit" name="decision" value="rejected" variant="outline" className="self-end">Reject</Button></form>}
        {reviews.length > 0 && request.status === "appealed" && <form action={finalizeVerification} className="mt-3"><input type="hidden" name="requestId" value={request.id} /><input type="hidden" name="note" value="The appeal was reviewed and the request is reopened for a new independent assessment." /><Button type="submit" name="decision" value="reopened" variant="outline">Reopen for reassessment</Button></form>}
      </article>)}</div>}
    </section>
    <section className="mt-6 rounded-xl border border-surface-200 bg-white"><header className="border-b border-surface-200 px-5 py-4"><h2 className="font-semibold">Approved reports</h2><p className="mt-1 text-xs text-surface-500">Revoking a report invalidates all public links immediately.</p></header>{approvedRequests.length ? <ul className="divide-y divide-surface-100">{approvedRequests.map(({ request, roleTitle }) => <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><span><strong className="text-sm">{roleTitle}</strong><span className="ml-2 text-xs text-surface-500">Request {request.id}</span></span><form action={revokeVerificationReport} className="flex flex-wrap items-center gap-2"><input type="hidden" name="requestId" value={request.id} /><input type="hidden" name="note" value="Report revoked after administrative review." /><Button type="submit" size="sm" variant="destructive">Revoke report</Button></form></li>)}</ul> : <p className="p-5 text-sm text-surface-500">No reports have been approved yet.</p>}</section>
  </div></main>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { and, asc, eq } from "drizzle-orm";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { recordConflictDisclosure } from "@/features/assessment/workflow-actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessorCalibration, assessorReview, assessmentRole, rubricVersion, user, verificationRequest } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Assessor workspace" };

export default async function AssessorDashboardPage() {
  const session = await requireRole(["assessor", "moderator"]);
  if (!db) return <main className="min-h-screen bg-surface-50 p-8"><h1 className="text-2xl font-semibold">Assessor workspace</h1><p className="mt-2 text-sm text-surface-600">The database is not configured.</p></main>;
  const reviews = await db.select({ review: assessorReview, request: verificationRequest, roleTitle: assessmentRole.title, rubricTitle: rubricVersion.title, learnerName: user.name })
    .from(assessorReview).innerJoin(verificationRequest, eq(assessorReview.requestId, verificationRequest.id))
    .innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .innerJoin(rubricVersion, eq(verificationRequest.rubricVersionId, rubricVersion.id))
    .innerJoin(user, eq(verificationRequest.learnerId, user.id))
    .where(eq(assessorReview.assessorId, session.user.id)).orderBy(asc(assessorReview.createdAt));
  const rubrics = await db.select({ rubric: rubricVersion, roleTitle: assessmentRole.title }).from(rubricVersion)
    .innerJoin(assessmentRole, eq(rubricVersion.roleId, assessmentRole.id))
    .where(and(eq(rubricVersion.status, "published"), eq(assessmentRole.active, true)));
  const calibrations = await db.select().from(assessorCalibration).where(eq(assessorCalibration.assessorId, session.user.id));
  const calibrationByRubric = new Map(calibrations.map((item) => [item.rubricVersionId, item]));
  return <main className="min-h-screen bg-surface-50 text-navy-950"><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <Badge variant="secondary" className="bg-accent-50 text-accent-800">Assessor workspace</Badge><h1 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Reviews and calibration</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-surface-600">Disclose conflicts before reviewing a submission. Complete rubric calibration so administrators can assign you work for that rubric version.</p>
    <section className="mt-8 rounded-xl border border-surface-200 bg-white"><header className="border-b border-surface-200 px-5 py-4"><h2 className="font-semibold">Assigned reviews</h2><p className="mt-1 text-xs text-surface-500">The learner&apos;s identity and submission evidence will be shown in the review workspace.</p></header>
      {reviews.length === 0 ? <p className="p-6 text-sm text-surface-500">No reviews are assigned to you yet. Approved calibration makes you eligible for new work.</p> : <div className="divide-y divide-surface-200">{reviews.map(({ review, request, roleTitle, rubricTitle, learnerName }) => <article key={review.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{roleTitle}</h3><p className="mt-1 text-xs text-surface-500">{rubricTitle} · Learner: {learnerName} · Request {request.id}</p></div><div className="flex flex-wrap gap-2"><StatusBadge status={review.status} /><StatusBadge status={review.conflictStatus} /></div></div>
        {review.conflictStatus === "pending" && <form action={recordConflictDisclosure} className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4"><input type="hidden" name="reviewId" value={review.id} /><div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 text-amber-800" /><div><h4 className="text-sm font-semibold">Conflict of interest disclosure</h4><p className="mt-1 text-xs leading-5 text-surface-600">Confirm whether you have a personal, financial, supervisory, or other relationship that could affect impartiality. If unsure, recuse and explain.</p></div></div><label className="mt-3 block text-sm font-medium">Reason or disclosure<textarea name="reason" maxLength={1500} className="mt-1.5 min-h-20 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm" placeholder="Optional when no conflict; required when recusing." /></label><div className="mt-3 flex flex-wrap gap-2"><Button type="submit" name="decision" value="cleared" className="bg-navy-900 text-white hover:bg-navy-800">No conflict — continue</Button><Button type="submit" name="decision" value="recused" variant="outline">Disclose conflict and recuse</Button></div></form>}
        {review.conflictStatus === "cleared" && <Button asChild className="mt-4 bg-navy-900 text-white hover:bg-navy-800"><Link href={`/assessor/reviews/${review.id}`}><FileCheck2 className="mr-2 size-4" />Open evidence review</Link></Button>}
        {review.conflictStatus === "recused" && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">You recused from this review. An administrator can assign another calibrated assessor.</p>}
      </article>)}</div>}
    </section>
    <section className="mt-6 rounded-xl border border-surface-200 bg-white"><header className="border-b border-surface-200 px-5 py-4"><h2 className="font-semibold">Rubric calibration</h2><p className="mt-1 text-xs text-surface-500">Calibration is version-specific and reviewed by an administrator or moderator.</p></header>
      {rubrics.length === 0 ? <p className="p-6 text-sm text-surface-500">There are no active published rubrics available for calibration.</p> : <div className="divide-y divide-surface-200">{rubrics.map(({ rubric, roleTitle }) => { const calibration = calibrationByRubric.get(rubric.id); return <article key={rubric.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h3 className="text-sm font-semibold">{roleTitle} · {rubric.title}</h3><p className="mt-1 text-xs text-surface-500">Version {rubric.version}{calibration?.reviewerNote ? ` · Reviewer: ${calibration.reviewerNote}` : ""}</p></div>{calibration?.status === "approved" ? <Badge variant="secondary" className="bg-emerald-50 text-emerald-800">Approved</Badge> : calibration?.status === "submitted" ? <Badge variant="secondary">Awaiting review</Badge> : <Button asChild variant="outline" size="sm"><Link href={`/assessor/calibration/${rubric.id}`}>{calibration?.status === "revision_requested" ? "Revise calibration" : calibration?.status === "draft" ? "Continue calibration" : "Start calibration"}<ArrowRight className="ml-2 size-4" /></Link></Button>}</article>; })}</div>}
    </section>
  </div></main>;
}

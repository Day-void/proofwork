import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ShareReportControls } from "@/components/reports/share-report-controls";
import { setVerificationDiscoverability } from "@/features/assessment/moderation-actions";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessorReview, assessmentRole, competencyRating, rubricCriterion, rubricVersion, verificationRequest, verificationShare } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Skills verification report" };

export default async function LearnerReportPage({ params }: { params: Promise<{ requestId: string }> }) {
  const session = await requireRole(["learner"]);
  const { requestId } = await params;
  if (!db) notFound();
  const [data] = await db.select({ request: verificationRequest, role: assessmentRole, rubric: rubricVersion })
    .from(verificationRequest).innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .innerJoin(rubricVersion, eq(verificationRequest.rubricVersionId, rubricVersion.id))
    .where(and(eq(verificationRequest.id, requestId), eq(verificationRequest.learnerId, session.user.id), eq(verificationRequest.status, "approved"))).limit(1);
  if (!data) notFound();
  const reviews = await db.select().from(assessorReview).where(and(eq(assessorReview.requestId, requestId), eq(assessorReview.status, "submitted"))).orderBy(asc(assessorReview.submittedAt));
  const ratings = await Promise.all(reviews.map(async (review) => ({
    review,
    competencies: await db!.select({ rating: competencyRating, criterion: rubricCriterion }).from(competencyRating)
      .innerJoin(rubricCriterion, eq(competencyRating.criterionId, rubricCriterion.id))
      .where(eq(competencyRating.reviewId, review.id)).orderBy(asc(rubricCriterion.sortOrder)),
  })));
  const shares = await db.select({ id: verificationShare.id, createdAt: verificationShare.createdAt, revokedAt: verificationShare.revokedAt })
    .from(verificationShare).where(eq(verificationShare.requestId, requestId)).orderBy(asc(verificationShare.createdAt));
  return <main className="min-h-screen bg-surface-50 text-navy-950"><div className="mx-auto max-w-4xl px-5 py-10 sm:px-8"><Link href="/dashboard/assessment" className="inline-flex items-center gap-2 text-sm text-surface-600"><ArrowLeft size={16} /> Assessment requests</Link>
    <article className="mt-5 rounded-2xl border border-surface-200 bg-white p-6 shadow-subtle sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge variant="secondary" className="bg-emerald-50 text-emerald-800"><BadgeCheck className="mr-1 size-3.5" /> Verified</Badge><h1 className="mt-4 text-3xl font-semibold tracking-[-.04em]">{data.role.title}</h1><p className="mt-2 text-sm text-surface-600">{data.role.targetLevel} · Rubric {data.rubric.title}</p></div><p className="text-xs text-surface-500">Issued {data.request.completedAt?.toLocaleDateString() ?? "recently"}</p></div>
      <p className="mt-5 text-sm leading-6 text-surface-700">{data.role.description}</p><p className="mt-4 whitespace-pre-wrap rounded-lg bg-surface-50 p-4 text-sm leading-6 text-surface-700">{data.request.decisionNote}</p>
      <section className="mt-7"><h2 className="font-semibold">Competency evidence and ratings</h2><p className="mt-1 text-xs text-surface-500">Ratings preserve each assessor’s independent judgment and the evidence reference used.</p><div className="mt-4 space-y-4">{ratings.map(({ review, competencies }, index) => <article key={review.id} className="rounded-xl border border-surface-200 p-4"><h3 className="text-sm font-semibold">Assessor review {index + 1}</h3><ul className="mt-3 divide-y divide-surface-100">{competencies.map(({ rating, criterion }) => <li key={rating.id} className="py-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm">{criterion.title}</strong><Badge variant="secondary">{rating.rating.replaceAll("_", " ")}</Badge></div><p className="mt-1 text-sm leading-6 text-surface-600">{rating.rationale}</p><p className="mt-1 text-xs text-surface-500">Evidence reference: {rating.evidenceReference}</p></li>)}</ul></article>)}</div></section>
      <form action={setVerificationDiscoverability} className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-200 p-4"><input type="hidden" name="requestId" value={requestId} /><div><h2 className="text-sm font-semibold">Employer profile visibility</h2><p className="mt-1 text-xs text-surface-600">{data.request.discoverable ? "This verified role is included when your profile is discoverable." : "This verified role is private from employer discovery."}</p></div><input type="hidden" name="discoverable" value={data.request.discoverable ? "false" : "true"} /><Button type="submit" size="sm" variant="outline">{data.request.discoverable ? "Hide this role" : "Include this role"}</Button></form>
      <ShareReportControls requestId={requestId} shares={shares} />
    </article>
  </div></main>;
}

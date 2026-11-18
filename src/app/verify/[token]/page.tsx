import type { Metadata } from "next";
import { asc, eq, isNull, and } from "drizzle-orm";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/database";
import { assessmentRole, assessorReview, competencyRating, rubricCriterion, rubricVersion, user, verificationRequest, verificationShare } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Verify a ProofWork report" };

const ratingLabels: Record<string, string> = {
  not_yet_demonstrated: "Not yet demonstrated",
  developing: "Developing",
  meets_expectations: "Meets expectations",
  strong: "Strong",
  insufficient_evidence: "Insufficient evidence",
};

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default async function PublicVerificationPage({ params }: { params: Promise<{ token: string }> }) {
  if (!db) notFound();
  const { token } = await params;
  if (token.length < 40 || token.length > 100) notFound();
  const tokenHash = await hashToken(token);
  const [data] = await db.select({ request: verificationRequest, role: assessmentRole, rubric: rubricVersion, learnerName: user.name })
    .from(verificationShare).innerJoin(verificationRequest, eq(verificationShare.requestId, verificationRequest.id))
    .innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .innerJoin(rubricVersion, eq(verificationRequest.rubricVersionId, rubricVersion.id))
    .innerJoin(user, eq(verificationRequest.learnerId, user.id))
    .where(and(eq(verificationShare.tokenHash, tokenHash), isNull(verificationShare.revokedAt), eq(verificationRequest.status, "approved"))).limit(1);
  if (!data) notFound();
  const reviews = await db.select({ id: assessorReview.id }).from(assessorReview)
    .where(and(eq(assessorReview.requestId, data.request.id), eq(assessorReview.status, "submitted")));
  const ratings = await Promise.all(reviews.map(async (review) => db!.select({ rating: competencyRating, criterion: rubricCriterion })
    .from(competencyRating).innerJoin(rubricCriterion, eq(competencyRating.criterionId, rubricCriterion.id))
    .where(eq(competencyRating.reviewId, review.id)).orderBy(asc(rubricCriterion.sortOrder))));
  const competencyRows = new Map<string, { title: string; ratings: string[] }>();
  for (const set of ratings) for (const item of set) {
    const row = competencyRows.get(item.criterion.id) ?? { title: item.criterion.title, ratings: [] };
    row.ratings.push(ratingLabels[item.rating.rating] ?? item.rating.rating.replaceAll("_", " "));
    competencyRows.set(item.criterion.id, row);
  }
  return <main className="min-h-screen bg-surface-50 px-5 py-12 text-navy-950"><article className="mx-auto max-w-3xl rounded-2xl border border-surface-200 bg-white p-6 shadow-subtle sm:p-9"><div className="flex items-center gap-2 text-accent-800"><ShieldCheck size={20} /><span className="text-sm font-semibold">ProofWork verification</span></div><div className="mt-7 flex flex-wrap items-start justify-between gap-4"><div><Badge variant="secondary" className="bg-emerald-50 text-emerald-800"><BadgeCheck className="mr-1 size-3.5" /> Verified</Badge><h1 className="mt-4 text-3xl font-semibold tracking-[-.04em]">{data.learnerName}</h1><p className="mt-2 text-lg text-surface-700">{data.role.title} · {data.role.targetLevel}</p></div><p className="text-xs text-surface-500">Verified {data.request.completedAt?.toLocaleDateString() ?? "recently"}</p></div><p className="mt-5 text-sm leading-6 text-surface-600">This report is backed by a versioned rubric and independent human review. It confirms the assessment outcome for the role shown.</p><section className="mt-7"><h2 className="font-semibold">Competency ratings</h2><p className="mt-1 text-sm text-surface-600">Each rating reflects the evidence an assessor observed against the published rubric.</p><ul className="mt-3 divide-y divide-surface-100 rounded-xl border border-surface-200 px-4">{[...competencyRows.values()].map((item) => <li key={item.title} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="text-sm font-medium">{item.title}</span><span className="text-xs text-surface-600">{item.ratings.join(" · ")}</span></li>)}</ul><p className="mt-3 text-xs text-surface-500">Rubric: {data.rubric.title}</p></section><p className="mt-7 border-t border-surface-100 pt-4 text-xs text-surface-500">This public view omits private submission content, assessor notes, and evidence URLs.</p></article></main>;
}

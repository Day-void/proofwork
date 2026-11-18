"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { requiresModeration } from "@/features/assessment/scoring";
import { assertTransition } from "@/features/assessment/state";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { transactionalDb } from "@/lib/database/transaction";
import {
  assessorCalibration,
  assessorReview,
  aiAnalysisJob,
  assessmentRole,
  challengeEvidence,
  challengeSubmission,
  competencyRating,
  rubricCriterion,
  rubricVersion,
  platformSetting,
  submissionEvidence,
  user,
  verificationRequest,
  type CalibrationAnswer,
} from "@/lib/database/schema";

function database() {
  if (!db) throw new Error("The database is not configured.");
  return db;
}

export async function assignAssessor(formData: FormData) {
  await requireRole(["admin"]);
  const values = z.object({ requestId: z.string().min(1).max(100), assessorId: z.string().min(1).max(100) }).parse({
    requestId: formData.get("requestId"), assessorId: formData.get("assessorId"),
  });
  const store = database();
  const [request] = await store.select({ request: verificationRequest, roleActive: assessmentRole.active, rubricStatus: rubricVersion.status })
    .from(verificationRequest)
    .innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .innerJoin(rubricVersion, eq(verificationRequest.rubricVersionId, rubricVersion.id))
    .where(and(eq(verificationRequest.id, values.requestId), eq(verificationRequest.status, "submitted"))).limit(1);
  const [assessor] = await store.select({ id: user.id, role: user.role }).from(user).where(eq(user.id, values.assessorId)).limit(1);
  if (!request || !request.roleActive || request.rubricStatus !== "published" || assessor?.role !== "assessor") {
    throw new Error("This request or assessor is not eligible for assignment.");
  }
  const [calibration] = await store.select({ status: assessorCalibration.status }).from(assessorCalibration)
    .where(and(eq(assessorCalibration.assessorId, values.assessorId), eq(assessorCalibration.rubricVersionId, request.request.rubricVersionId))).limit(1);
  if (calibration?.status !== "approved") throw new Error("The assessor must complete calibration for this rubric before assignment.");
  if (request.request.learnerId === values.assessorId) throw new Error("Assessors cannot review their own submissions.");
  const [existing] = await store.select({ id: assessorReview.id }).from(assessorReview)
    .where(and(eq(assessorReview.requestId, values.requestId), eq(assessorReview.assessorId, values.assessorId))).limit(1);
  if (existing) throw new Error("This assessor has already been assigned to the request.");
  await store.insert(assessorReview).values({
    id: crypto.randomUUID(), requestId: values.requestId, assessorId: values.assessorId,
    status: "assigned", conflictStatus: "pending",
  });
  revalidatePath("/admin/assessments");
  redirect("/admin/assessments?assigned=1");
}

export async function recordConflictDisclosure(formData: FormData) {
  const session = await requireRole(["assessor", "moderator"]);
  const values = z.object({
    reviewId: z.string().min(1).max(100),
    decision: z.enum(["cleared", "recused"]),
    reason: z.string().trim().max(1500),
  }).parse({ reviewId: formData.get("reviewId"), decision: formData.get("decision"), reason: formData.get("reason") ?? "" });
  if (values.decision === "recused" && values.reason.length < 10) throw new Error("Please explain the conflict so an administrator can reassign the review.");
  const store = database();
  const [review] = await store.select().from(assessorReview).where(and(
    eq(assessorReview.id, values.reviewId), eq(assessorReview.assessorId, session.user.id),
    eq(assessorReview.conflictStatus, "pending"), eq(assessorReview.status, "assigned"),
  )).limit(1);
  if (!review) throw new Error("This review is not awaiting your disclosure.");
  const writeStore = transactionalDb ?? store;
  await writeStore.transaction(async (tx) => {
    await tx.update(assessorReview).set({
      conflictStatus: values.decision,
      conflictReason: values.reason || null,
      status: values.decision === "recused" ? "recused" : "in_progress",
    }).where(eq(assessorReview.id, review.id));
    if (values.decision === "cleared") {
      const [request] = await tx.select({ status: verificationRequest.status }).from(verificationRequest).where(eq(verificationRequest.id, review.requestId)).limit(1);
      if (request) assertTransition(request.status, "in_review");
      await tx.update(verificationRequest).set({ status: "in_review" }).where(eq(verificationRequest.id, review.requestId));
    }
  });
  revalidatePath("/assessor");
  revalidatePath("/admin/assessments");
  redirect("/assessor?disclosureRecorded=1");
}

export async function submitCalibration(formData: FormData) {
  const session = await requireRole(["assessor", "moderator"]);
  const rubricVersionId = z.string().min(1).max(100).parse(formData.get("rubricVersionId"));
  const store = database();
  const [rubric] = await store.select({ id: rubricVersion.id }).from(rubricVersion).where(and(
    eq(rubricVersion.id, rubricVersionId), eq(rubricVersion.status, "published"),
  )).limit(1);
  if (!rubric) throw new Error("Published rubric not found.");
  const criteria = await store.select({ id: rubricCriterion.id }).from(rubricCriterion)
    .where(eq(rubricCriterion.rubricVersionId, rubricVersionId));
  if (criteria.length < 5) throw new Error("This rubric is not ready for calibration.");
  const answerSchema = z.object({
    criterionId: z.string().min(1),
    rating: z.enum(["developing", "meets_expectations", "strong"]),
    rationale: z.string().trim().min(20).max(1000),
  });
  const answers: CalibrationAnswer[] = criteria.map(({ id }) => answerSchema.parse({
    criterionId: id,
    rating: formData.get(`rating:${id}`),
    rationale: formData.get(`rationale:${id}`),
  }));
  const assessorNote = z.string().trim().max(2000).parse(formData.get("assessorNote") ?? "");
  const [existing] = await store.select().from(assessorCalibration).where(and(
    eq(assessorCalibration.assessorId, session.user.id), eq(assessorCalibration.rubricVersionId, rubricVersionId),
  )).limit(1);
  if (existing?.status === "approved") throw new Error("Calibration is already approved for this rubric version.");
  if (existing) {
    await store.update(assessorCalibration).set({ answers, assessorNote, status: "submitted", submittedAt: new Date(), updatedAt: new Date(), reviewerNote: null, reviewedBy: null, reviewedAt: null })
      .where(eq(assessorCalibration.id, existing.id));
  } else {
    await store.insert(assessorCalibration).values({ id: crypto.randomUUID(), assessorId: session.user.id, rubricVersionId, answers, assessorNote, status: "submitted", submittedAt: new Date() });
  }
  revalidatePath("/assessor");
  revalidatePath("/admin/assessments");
  redirect("/assessor?calibrationSubmitted=1");
}

export async function reviewCalibration(formData: FormData) {
  const session = await requireRole(["admin", "moderator"]);
  const values = z.object({
    calibrationId: z.string().min(1).max(100),
    decision: z.enum(["approved", "revision_requested"]),
    reviewerNote: z.string().trim().min(10).max(2000),
  }).parse({ calibrationId: formData.get("calibrationId"), decision: formData.get("decision"), reviewerNote: formData.get("reviewerNote") });
  const store = database();
  const [calibration] = await store.select({ id: assessorCalibration.id }).from(assessorCalibration).where(and(
    eq(assessorCalibration.id, values.calibrationId), eq(assessorCalibration.status, "submitted"),
  )).limit(1);
  if (!calibration) throw new Error("Submitted calibration not found.");
  await store.update(assessorCalibration).set({
    status: values.decision, reviewerNote: values.reviewerNote, reviewedBy: session.user.id, reviewedAt: new Date(), updatedAt: new Date(),
  }).where(eq(assessorCalibration.id, calibration.id));
  revalidatePath("/admin/assessments");
  revalidatePath("/assessor");
  redirect("/admin/assessments?calibrationReviewed=1");
}

async function saveReview(formData: FormData, submit: boolean) {
  const session = await requireRole(["assessor"]);
  const reviewId = z.string().min(1).max(100).parse(formData.get("reviewId"));
  const store = database();
  const [review] = await store.select({ review: assessorReview, request: verificationRequest })
    .from(assessorReview).innerJoin(verificationRequest, eq(assessorReview.requestId, verificationRequest.id))
    .where(and(eq(assessorReview.id, reviewId), eq(assessorReview.assessorId, session.user.id), eq(assessorReview.status, "in_progress"), eq(assessorReview.conflictStatus, "cleared")))
    .limit(1);
  if (!review) throw new Error("This review is unavailable or your conflict disclosure is not cleared.");
  const criteria = await store.select().from(rubricCriterion).where(eq(rubricCriterion.rubricVersionId, review.request.rubricVersionId));
  if (!criteria.length) throw new Error("The review rubric has no criteria.");
  const portfolio = await store.select({ id: submissionEvidence.id }).from(submissionEvidence)
    .where(eq(submissionEvidence.submissionId, review.request.portfolioSubmissionId));
  const challenge = await store.select({ id: challengeEvidence.id }).from(challengeEvidence)
    .where(eq(challengeEvidence.challengeSubmissionId, review.request.challengeSubmissionId));
  const [challengeWork] = await store.select({ sourceUrl: challengeSubmission.sourceUrl, demoUrl: challengeSubmission.demoUrl })
    .from(challengeSubmission).where(eq(challengeSubmission.id, review.request.challengeSubmissionId)).limit(1);
  const allowedReferences = new Set([
    "portfolio:narrative", ...portfolio.map((item) => `portfolio:${item.id}`),
    "challenge:response", ...challenge.map((item) => `challenge:${item.id}`),
    ...(challengeWork?.sourceUrl ? ["challenge:source"] : []),
    ...(challengeWork?.demoUrl ? ["challenge:demo"] : []),
  ]);
  const ratingSchema = z.enum(["not_yet_demonstrated", "developing", "meets_expectations", "strong", "insufficient_evidence"]);
  const updates: Array<typeof competencyRating.$inferInsert> = [];
  for (const criterion of criteria) {
    const rawRating = formData.get(`rating:${criterion.id}`);
    const rawRationale = formData.get(`rationale:${criterion.id}`);
    const rawReference = formData.get(`evidence:${criterion.id}`);
    if (!submit && (!rawRating || !rawRationale || !rawReference)) continue;
    const rating = ratingSchema.parse(rawRating);
    const rationale = z.string().trim().min(20).max(2000).parse(rawRationale);
    const evidenceReference = z.string().min(3).max(200).parse(rawReference);
    if (!allowedReferences.has(evidenceReference)) throw new Error("Choose evidence attached to this verification request.");
    updates.push({
      id: crypto.randomUUID(), reviewId, criterionId: criterion.id, rating, rationale, evidenceReference, updatedAt: new Date(),
    });
  }
  if (submit && updates.length !== criteria.length) throw new Error("Complete every rubric criterion before submitting the review.");
  if (!submit) {
    for (const update of updates) {
      await store.insert(competencyRating).values(update).onConflictDoUpdate({
        target: [competencyRating.reviewId, competencyRating.criterionId],
        set: { rating: update.rating, rationale: update.rationale, evidenceReference: update.evidenceReference, updatedAt: update.updatedAt },
      });
    }
    revalidatePath(`/assessor/reviews/${reviewId}`);
    redirect(`/assessor/reviews/${reviewId}?saved=1`);
  }
  if (transactionalDb) {
    await transactionalDb.transaction(async (tx) => {
      for (const update of updates) {
        await tx.insert(competencyRating).values(update).onConflictDoUpdate({
          target: [competencyRating.reviewId, competencyRating.criterionId],
          set: { rating: update.rating, rationale: update.rationale, evidenceReference: update.evidenceReference, updatedAt: update.updatedAt },
        });
      }
      await tx.update(assessorReview).set({ status: "submitted", submittedAt: new Date() }).where(eq(assessorReview.id, reviewId));
    });
  } else {
    for (const update of updates) {
      await store.insert(competencyRating).values(update).onConflictDoUpdate({
        target: [competencyRating.reviewId, competencyRating.criterionId],
        set: { rating: update.rating, rationale: update.rationale, evidenceReference: update.evidenceReference, updatedAt: update.updatedAt },
      });
    }
    await store.update(assessorReview).set({ status: "submitted", submittedAt: new Date() }).where(eq(assessorReview.id, reviewId));
  }
  const otherReviews = await store.select({ id: assessorReview.id }).from(assessorReview).where(and(
    eq(assessorReview.requestId, review.request.id), eq(assessorReview.status, "submitted"),
  ));
  const [job] = await store.select({ id: aiAnalysisJob.id }).from(aiAnalysisJob).where(eq(aiAnalysisJob.requestId, review.request.id)).limit(1);
  const [request] = await store.select({ consent: verificationRequest.aiAnalysisConsent }).from(verificationRequest).where(eq(verificationRequest.id, review.request.id)).limit(1);
  const [aiEnabled] = await store.select({ value: platformSetting.value }).from(platformSetting).where(eq(platformSetting.key, "ai_analysis_enabled")).limit(1);
  if (!job && request?.consent && aiEnabled?.value === "true") {
    await store.insert(aiAnalysisJob).values({ id: crypto.randomUUID(), requestId: review.request.id, status: "queued" }).onConflictDoNothing({ target: aiAnalysisJob.requestId });
  }
  if (otherReviews.length >= 2) {
    const submittedIds = otherReviews.map(({ id }) => id);
    const ratings = await store.select().from(competencyRating).where(inArray(competencyRating.reviewId, submittedIds));
    const disagreement = requiresModeration(ratings.map((rating) => ({ reviewId: rating.reviewId, criterionId: rating.criterionId, rating: rating.rating })));
    if (disagreement) await store.update(verificationRequest).set({ status: "moderation" }).where(eq(verificationRequest.id, review.request.id));
  }
  revalidatePath("/assessor");
  revalidatePath("/admin/assessments");
  redirect("/assessor?reviewSubmitted=1");
}

export async function saveAssessmentDraft(formData: FormData) {
  await saveReview(formData, false);
}

export async function submitAssessmentReview(formData: FormData) {
  await saveReview(formData, true);
}

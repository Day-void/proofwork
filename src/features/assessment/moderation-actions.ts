"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { requireRole } from "@/lib/auth/guards";
import { transactionalDb } from "@/lib/database/transaction";
import { auditLog, assessorReview, platformSetting, verificationRequest, verificationShare } from "@/lib/database/schema";
import { env } from "@/config/env";
import { assertTransition } from "@/features/assessment/state";

function transactionDatabase() {
  if (!transactionalDb) {
    throw new Error("Assessment updates need a transaction-capable Neon connection. Configure DATABASE_URL_UNPOOLED and try again.");
  }
  return transactionalDb;
}

export async function finalizeVerification(formData: FormData) {
  const session = await requireRole(["admin", "moderator"]);
  const values = z.object({
    requestId: z.string().min(1).max(100),
    decision: z.enum(["approved", "rejected", "needs_more_evidence", "reopened"]),
    note: z.string().trim().min(20).max(3000),
  }).parse({ requestId: formData.get("requestId"), decision: formData.get("decision"), note: formData.get("note") });
  await transactionDatabase().transaction(async (tx) => {
    const [request] = await tx.select().from(verificationRequest).where(eq(verificationRequest.id, values.requestId)).for("update").limit(1);
    if (!request || !["in_review", "moderation", "appealed"].includes(request.status)) throw new Error("This request is not awaiting a final decision.");
    if (values.decision === "reopened" && request.status !== "appealed") throw new Error("Only an appealed request can be reopened.");
    const reviews = await tx.select({ id: assessorReview.id }).from(assessorReview).where(and(
      eq(assessorReview.requestId, request.id), eq(assessorReview.status, "submitted"),
    ));
    if (!reviews.length) throw new Error("At least one submitted assessor review is required before a decision.");
    const status = values.decision === "reopened" ? "submitted" : values.decision;
    assertTransition(request.status, status);
    const terminal = status === "approved" || status === "rejected";
    await tx.update(verificationRequest).set({ status, decisionNote: values.note, completedAt: terminal ? new Date() : null })
      .where(eq(verificationRequest.id, request.id));
    await tx.insert(auditLog).values({
      id: crypto.randomUUID(), actorId: session.user.id, action: `verification_${values.decision}`,
      targetType: "verification_request", targetId: request.id,
      details: { priorStatus: request.status, note: values.note },
    });
  });
  revalidatePath("/admin/assessments");
  revalidatePath("/dashboard/assessment");
  redirect("/admin/assessments?decisionSaved=1");
}

export async function appealVerification(formData: FormData) {
  const session = await requireRole(["learner"]);
  const values = z.object({ requestId: z.string().min(1).max(100), reason: z.string().trim().min(30).max(3000) }).parse({
    requestId: formData.get("requestId"), reason: formData.get("reason"),
  });
  await transactionDatabase().transaction(async (tx) => {
    const [request] = await tx.select().from(verificationRequest).where(and(
      eq(verificationRequest.id, values.requestId), eq(verificationRequest.learnerId, session.user.id),
    )).for("update").limit(1);
    if (!request || !["approved", "rejected", "needs_more_evidence"].includes(request.status)) throw new Error("This verification cannot be appealed in its current state.");
    assertTransition(request.status, "appealed");
    const priorNote = request.decisionNote ? `${request.decisionNote}\n\nAppeal: ${values.reason}` : `Appeal: ${values.reason}`;
    await tx.update(verificationRequest).set({ status: "appealed", decisionNote: priorNote }).where(eq(verificationRequest.id, request.id));
    await tx.insert(auditLog).values({ id: crypto.randomUUID(), actorId: session.user.id, action: "verification_appealed", targetType: "verification_request", targetId: request.id, details: { priorStatus: request.status } });
  });
  revalidatePath("/dashboard/assessment");
  revalidatePath("/admin/assessments");
  redirect("/dashboard/assessment?appealSubmitted=1");
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createReportShare(_previous: { url?: string; error?: string }, formData: FormData): Promise<{ url?: string; error?: string }> {
  const session = await requireRole(["learner"]);
  const requestId = z.string().min(1).max(100).parse(formData.get("requestId"));
  const token = `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
  const tokenHash = await hashToken(token);
  const created = await transactionDatabase().transaction(async (tx) => {
    const [request] = await tx.select({ id: verificationRequest.id }).from(verificationRequest).where(and(
      eq(verificationRequest.id, requestId), eq(verificationRequest.learnerId, session.user.id), eq(verificationRequest.status, "approved"),
    )).for("update").limit(1);
    if (!request) return false;
    await tx.insert(verificationShare).values({ id: crypto.randomUUID(), requestId, createdBy: session.user.id, tokenHash });
    await tx.insert(auditLog).values({ id: crypto.randomUUID(), actorId: session.user.id, action: "verification_share_created", targetType: "verification_request", targetId: requestId, details: {} });
    return true;
  });
  if (!created) return { error: "Only approved reports can be shared." };
  revalidatePath(`/dashboard/reports/${requestId}`);
  return { url: `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/verify/${token}` };
}

export async function revokeReportShare(formData: FormData) {
  const session = await requireRole(["learner"]);
  const shareId = z.string().min(1).max(100).parse(formData.get("shareId"));
  const requestId = await transactionDatabase().transaction(async (tx) => {
    const [share] = await tx.select({ id: verificationShare.id, requestId: verificationShare.requestId, createdBy: verificationShare.createdBy, revokedAt: verificationShare.revokedAt })
      .from(verificationShare).where(eq(verificationShare.id, shareId)).for("update").limit(1);
    if (!share || share.createdBy !== session.user.id || share.revokedAt) throw new Error("Share link not found.");
    const [request] = await tx.select({ learnerId: verificationRequest.learnerId }).from(verificationRequest)
      .where(eq(verificationRequest.id, share.requestId)).limit(1);
    if (request?.learnerId !== session.user.id) throw new Error("Share link not found.");
    await tx.update(verificationShare).set({ revokedAt: new Date() }).where(eq(verificationShare.id, shareId));
    await tx.insert(auditLog).values({ id: crypto.randomUUID(), actorId: session.user.id, action: "verification_share_revoked", targetType: "verification_share", targetId: shareId, details: {} });
    return share.requestId;
  });
  revalidatePath(`/dashboard/reports/${requestId}`);
  redirect(`/dashboard/reports/${requestId}`);
}

export async function revokeVerificationReport(formData: FormData) {
  const actor = await requireRole(["admin", "moderator"]);
  const requestId = z.string().min(1).max(100).parse(formData.get("requestId"));
  const note = z.string().trim().min(20).max(2000).parse(formData.get("note"));
  await transactionDatabase().transaction(async (tx) => {
    const [request] = await tx.select().from(verificationRequest).where(and(eq(verificationRequest.id, requestId), eq(verificationRequest.status, "approved"))).for("update").limit(1);
    if (!request) throw new Error("Only approved verification reports can be revoked.");
    await tx.update(verificationRequest).set({ status: "revoked", decisionNote: `${request.decisionNote ?? ""}\n\nRevocation: ${note}` }).where(eq(verificationRequest.id, requestId));
    await tx.insert(auditLog).values({ id: crypto.randomUUID(), actorId: actor.user.id, action: "verification_report_revoked", targetType: "verification_request", targetId: requestId, details: { note } });
  });
  revalidatePath("/admin/assessments");
  revalidatePath("/dashboard/assessment");
  redirect("/admin/assessments?reportRevoked=1");
}

export async function setVerificationDiscoverability(formData: FormData) {
  const session = await requireRole(["learner"]);
  const values = z.object({ requestId: z.string().min(1).max(100), discoverable: z.enum(["true", "false"]) }).parse({
    requestId: formData.get("requestId"), discoverable: formData.get("discoverable"),
  });
  const discoverable = values.discoverable === "true";
  const requestId = await transactionDatabase().transaction(async (tx) => {
    const [request] = await tx.select().from(verificationRequest).where(and(
      eq(verificationRequest.id, values.requestId), eq(verificationRequest.learnerId, session.user.id), eq(verificationRequest.status, "approved"),
    )).for("update").limit(1);
    if (!request) throw new Error("Only approved reports can be listed for employer discovery.");
    const [setting] = await tx.select({ value: platformSetting.value }).from(platformSetting).where(eq(platformSetting.key, "employer_discovery_enabled")).limit(1);
    if (discoverable && setting?.value !== "true") throw new Error("Employer discovery is currently paused.");
    await tx.update(verificationRequest).set({ discoverable }).where(eq(verificationRequest.id, request.id));
    await tx.insert(auditLog).values({ id: crypto.randomUUID(), actorId: session.user.id, action: discoverable ? "verification_discoverability_enabled" : "verification_discoverability_disabled", targetType: "verification_request", targetId: request.id, details: {} });
    return request.id;
  });
  revalidatePath(`/dashboard/reports/${requestId}`);
  revalidatePath("/employer");
  redirect(`/dashboard/reports/${requestId}`);
}

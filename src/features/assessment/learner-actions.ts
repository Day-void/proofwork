"use server";

import { and, desc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessmentRole, challengeSubmission, learnerProject, platformSetting, projectSubmission, roleChallenge, rubricVersion, verificationRequest } from "@/lib/database/schema";

function database() {
  if (!db) throw new Error("The database is not configured.");
  return db;
}

export async function startRoleChallenge(formData: FormData) {
  const session = await requireRole(["learner"]);
  const roleId = z.string().min(1).max(100).parse(formData.get("roleId"));
  const store = database();
  const [publishedChallenge] = await store.select().from(roleChallenge)
    .innerJoin(assessmentRole, eq(roleChallenge.roleId, assessmentRole.id))
    .where(and(eq(roleChallenge.roleId, roleId), eq(roleChallenge.status, "published"), eq(assessmentRole.active, true)))
    .orderBy(desc(roleChallenge.version)).limit(1);
  if (!publishedChallenge) throw new Error("This role does not have an active published challenge.");
  const challenge = publishedChallenge.role_challenge;
  const [draft] = await store.select({ id: challengeSubmission.id }).from(challengeSubmission).where(and(
    eq(challengeSubmission.challengeId, challenge.id), eq(challengeSubmission.learnerId, session.user.id), eq(challengeSubmission.status, "draft"),
  )).limit(1);
  if (draft) redirect("/dashboard/assessment");
  const [latest] = await store.select({ version: max(challengeSubmission.version) }).from(challengeSubmission).where(and(
    eq(challengeSubmission.challengeId, challenge.id), eq(challengeSubmission.learnerId, session.user.id),
  ));
  await store.insert(challengeSubmission).values({ id: crypto.randomUUID(), challengeId: challenge.id, learnerId: session.user.id, version: (latest?.version ?? 0) + 1 });
  revalidatePath("/dashboard/assessment");
  redirect("/dashboard/assessment");
}

async function saveChallenge(formData: FormData, submit: boolean) {
  const session = await requireRole(["learner"]);
  const submissionId = z.string().min(1).max(100).parse(formData.get("submissionId"));
  const values = z.object({
    response: z.string().trim().min(submit ? 40 : 0).max(8000),
    sourceUrl: z.union([z.literal(""), z.string().url().max(2000)]),
    demoUrl: z.union([z.literal(""), z.string().url().max(2000)]),
    assistanceDisclosure: z.string().trim().max(2000),
  }).parse({
    response: formData.get("response"), sourceUrl: formData.get("sourceUrl"),
    demoUrl: formData.get("demoUrl"), assistanceDisclosure: formData.get("assistanceDisclosure"),
  });
  for (const value of [values.sourceUrl, values.demoUrl]) {
    if (value && !["http:", "https:"].includes(new URL(value).protocol)) throw new Error("Evidence links must use HTTP or HTTPS.");
  }
  const store = database();
  const [submission] = await store.select({ submission: challengeSubmission, challenge: roleChallenge })
    .from(challengeSubmission).innerJoin(roleChallenge, eq(challengeSubmission.challengeId, roleChallenge.id))
    .where(and(eq(challengeSubmission.id, submissionId), eq(challengeSubmission.learnerId, session.user.id), eq(challengeSubmission.status, "draft"), eq(roleChallenge.status, "published"))).limit(1);
  if (!submission) throw new Error("Draft challenge submission not found.");
  await store.update(challengeSubmission).set({
    ...values,
    status: submit ? "submitted" : "draft",
    submittedAt: submit ? new Date() : null,
  }).where(eq(challengeSubmission.id, submissionId));
  revalidatePath("/dashboard/assessment");
  redirect(submit ? "/dashboard/assessment?challengeSubmitted=1" : "/dashboard/assessment?challengeSaved=1");
}

export async function saveRoleChallengeDraft(formData: FormData) {
  await saveChallenge(formData, false);
}

export async function submitRoleChallenge(formData: FormData) {
  await saveChallenge(formData, true);
}

export async function createVerificationRequest(formData: FormData) {
  const session = await requireRole(["learner"]);
  const values = z.object({
    roleId: z.string().min(1).max(100),
    portfolioSubmissionId: z.string().min(1).max(100),
    challengeSubmissionId: z.string().min(1).max(100),
    discoverable: z.boolean(),
    aiAnalysisConsent: z.boolean(),
  }).parse({
    roleId: formData.get("roleId"),
    portfolioSubmissionId: formData.get("portfolioSubmissionId"),
    challengeSubmissionId: formData.get("challengeSubmissionId"),
    discoverable: formData.get("discoverable") === "on",
    aiAnalysisConsent: formData.get("aiAnalysisConsent") === "on",
  });
  const store = database();
  const [assessmentsEnabled] = await store.select({ value: platformSetting.value }).from(platformSetting).where(eq(platformSetting.key, "new_assessments_enabled")).limit(1);
  if (assessmentsEnabled?.value !== "true") throw new Error("New assessment requests are currently paused by ProofWork administration.");
  const [employerSetting] = await store.select({ value: platformSetting.value }).from(platformSetting).where(eq(platformSetting.key, "employer_discovery_enabled")).limit(1);
  const profileDiscoverable = values.discoverable && employerSetting?.value === "true";
  const [role] = await store.select({ rubricId: rubricVersion.id }).from(assessmentRole)
    .innerJoin(rubricVersion, eq(rubricVersion.roleId, assessmentRole.id))
    .where(and(eq(assessmentRole.id, values.roleId), eq(assessmentRole.active, true), eq(rubricVersion.status, "published")))
    .orderBy(desc(rubricVersion.version)).limit(1);
  const [portfolio] = await store.select({ id: projectSubmission.id }).from(projectSubmission)
    .innerJoin(learnerProject, eq(projectSubmission.projectId, learnerProject.id))
    .where(and(eq(projectSubmission.id, values.portfolioSubmissionId), eq(learnerProject.learnerId, session.user.id), eq(projectSubmission.status, "submitted"))).limit(1);
  const [challenge] = await store.select({ challenge: roleChallenge }).from(challengeSubmission)
    .innerJoin(roleChallenge, eq(challengeSubmission.challengeId, roleChallenge.id))
    .where(and(eq(challengeSubmission.id, values.challengeSubmissionId), eq(challengeSubmission.learnerId, session.user.id), eq(challengeSubmission.status, "submitted"), eq(roleChallenge.roleId, values.roleId), eq(roleChallenge.status, "published"))).limit(1);
  if (!role || !portfolio || !challenge) throw new Error("Choose a submitted portfolio and challenge for an active role.");
  const [existing] = await store.select({ id: verificationRequest.id }).from(verificationRequest).where(and(
    eq(verificationRequest.learnerId, session.user.id), eq(verificationRequest.portfolioSubmissionId, values.portfolioSubmissionId),
    eq(verificationRequest.challengeSubmissionId, values.challengeSubmissionId),
  )).limit(1);
  if (existing) throw new Error("A verification request already exists for these submitted versions.");
  await store.insert(verificationRequest).values({
    id: crypto.randomUUID(), learnerId: session.user.id, roleId: values.roleId,
    rubricVersionId: role.rubricId, portfolioSubmissionId: values.portfolioSubmissionId,
    challengeSubmissionId: values.challengeSubmissionId, status: "submitted", discoverable: profileDiscoverable,
    aiAnalysisConsent: values.aiAnalysisConsent,
  });
  revalidatePath("/dashboard/assessment");
  revalidatePath("/admin/assessments");
  redirect("/dashboard/assessment?requestSubmitted=1");
}

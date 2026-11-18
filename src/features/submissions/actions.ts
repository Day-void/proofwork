"use server";

import { and, eq, isNull, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { db } from "@/lib/database";
import { learnerProfile, learnerProject, projectSubmission, submissionEvidence, uploadSession } from "@/lib/database/schema";
import { requireRole } from "@/lib/auth/guards";

function requireDatabase() {
  if (!db) throw new Error("The database is not configured.");
  return db;
}

const projectFields = z.object({
  title: z.string().trim().min(3).max(100),
  summary: z.string().trim().min(20).max(800),
  skillArea: z.string().trim().min(2).max(80),
});

export async function createProject(formData: FormData) {
  const session = await requireRole(["learner"]);
  const database = requireDatabase();
  const values = projectFields.parse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    skillArea: formData.get("skillArea"),
  });
  const id = crypto.randomUUID();
  await database.insert(learnerProject).values({ id, learnerId: session.user.id, ...values });
  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${id}`);
}

export async function saveLearnerProfile(formData: FormData) {
  const session = await requireRole(["learner"]);
  const database = requireDatabase();
  const values = z.object({
    headline: z.string().trim().max(100),
    bio: z.string().trim().max(1000),
    portfolioUrl: z.union([z.literal(""), z.string().url().max(500)]),
    discoverable: z.boolean(),
  }).parse({
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    portfolioUrl: formData.get("portfolioUrl"),
    discoverable: formData.get("discoverable") === "on",
  });
  await database.insert(learnerProfile).values({ id: crypto.randomUUID(), userId: session.user.id, ...values })
    .onConflictDoUpdate({ target: learnerProfile.userId, set: { ...values, updatedAt: new Date() } });
  revalidatePath("/dashboard/profile");
  revalidatePath("/employer");
  redirect("/dashboard/profile?saved=1");
}

async function ownedProject(projectId: string, userId: string) {
  const [project] = await requireDatabase().select().from(learnerProject)
    .where(and(eq(learnerProject.id, projectId), eq(learnerProject.learnerId, userId))).limit(1);
  if (!project) throw new Error("Project not found.");
  return project;
}

export async function startSubmission(formData: FormData) {
  const session = await requireRole(["learner"]);
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  await ownedProject(projectId, session.user.id);
  const database = requireDatabase();
  const [existingDraft] = await database.select({ id: projectSubmission.id }).from(projectSubmission)
    .where(and(eq(projectSubmission.projectId, projectId), eq(projectSubmission.status, "draft"))).limit(1);
  if (existingDraft) redirect(`/dashboard/projects/${projectId}`);
  let created = false;
  for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
    const [result] = await database.select({ latest: max(projectSubmission.version) }).from(projectSubmission)
      .where(eq(projectSubmission.projectId, projectId));
    try {
      await database.insert(projectSubmission).values({ id: crypto.randomUUID(), projectId, version: (result?.latest ?? 0) + 1 });
      created = true;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
  revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(`/dashboard/projects/${projectId}`);
}

async function ownedDraft(submissionId: string, userId: string) {
  const database = requireDatabase();
  const [draft] = await database.select({ submission: projectSubmission, project: learnerProject })
    .from(projectSubmission)
    .innerJoin(learnerProject, eq(projectSubmission.projectId, learnerProject.id))
    .where(and(
      eq(projectSubmission.id, submissionId),
      eq(learnerProject.learnerId, userId),
      eq(projectSubmission.status, "draft"),
    )).limit(1);
  if (!draft) throw new Error("Draft not found or already submitted.");
  return { submission: draft.submission, project: draft.project };
}

const submissionFields = z.object({
  projectDescription: z.string().trim().min(30).max(5000),
  process: z.string().trim().min(30).max(5000),
  outcomes: z.string().trim().min(20).max(3000),
});

export async function saveSubmissionDraft(formData: FormData) {
  const session = await requireRole(["learner"]);
  const submissionId = z.string().uuid().parse(formData.get("submissionId"));
  const { submission } = await ownedDraft(submissionId, session.user.id);
  const values = z.object({
    projectDescription: z.string().trim().max(5000),
    process: z.string().trim().max(5000),
    outcomes: z.string().trim().max(3000),
  }).parse({ projectDescription: formData.get("projectDescription"), process: formData.get("process"), outcomes: formData.get("outcomes") });
  await requireDatabase().update(projectSubmission).set(values).where(eq(projectSubmission.id, submission.id));
  revalidatePath(`/dashboard/projects/${submission.projectId}`);
  redirect(`/dashboard/projects/${submission.projectId}?saved=1`);
}

export async function addEvidenceLink(formData: FormData) {
  const session = await requireRole(["learner"]);
  const submissionId = z.string().uuid().parse(formData.get("submissionId"));
  const { submission } = await ownedDraft(submissionId, session.user.id);
  const values = z.object({ title: z.string().trim().min(2).max(100), url: z.string().url().max(2000) })
    .parse({ title: formData.get("title"), url: formData.get("url") });
  const parsedUrl = new URL(values.url);
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") throw new Error("Evidence links must use HTTP or HTTPS.");
  await requireDatabase().insert(submissionEvidence).values({
    id: crypto.randomUUID(), submissionId, kind: "link", ...values,
  });
  revalidatePath(`/dashboard/projects/${submission.projectId}`);
  redirect(`/dashboard/projects/${submission.projectId}`);
}

export async function attachEvidenceFile(formData: FormData) {
  const session = await requireRole(["learner"]);
  const uploadSessionId = z.string().uuid().parse(formData.get("uploadSessionId"));
  const title = z.string().trim().min(2).max(100).parse(formData.get("title"));
  const database = requireDatabase();
  const [pending] = await database.select().from(uploadSession)
    .where(and(eq(uploadSession.id, uploadSessionId), eq(uploadSession.userId, session.user.id))).limit(1);
  if (!pending || pending.usedAt || pending.expiresAt <= new Date()) throw new Error("This upload has expired. Please upload the file again.");
  const { submission } = await ownedDraft(pending.submissionId, session.user.id);
  const [claimed] = await database.update(uploadSession).set({ usedAt: new Date() })
    .where(and(eq(uploadSession.id, pending.id), isNull(uploadSession.usedAt))).returning({ id: uploadSession.id });
  if (!claimed) throw new Error("This upload has already been attached.");
  await database.insert(submissionEvidence).values({
    id: crypto.randomUUID(), submissionId: submission.id, kind: "file", title, objectKey: pending.objectKey, contentType: pending.contentType, byteSize: pending.byteSize,
  });
  revalidatePath(`/dashboard/projects/${submission.projectId}`);
  redirect(`/dashboard/projects/${submission.projectId}`);
}

export async function submitSubmission(formData: FormData) {
  const session = await requireRole(["learner"]);
  const submissionId = z.string().uuid().parse(formData.get("submissionId"));
  const { submission } = await ownedDraft(submissionId, session.user.id);
  const values = submissionFields.parse({
    projectDescription: formData.get("projectDescription"),
    process: formData.get("process"),
    outcomes: formData.get("outcomes"),
  });
  const consentRecorded = formData.get("consentRecorded") === "on";
  const integrityConfirmed = formData.get("integrityConfirmed") === "on";
  if (!consentRecorded || !integrityConfirmed) throw new Error("Confirm the consent and integrity statements before submitting.");
  const [evidence] = await requireDatabase().select({ id: submissionEvidence.id }).from(submissionEvidence)
    .where(eq(submissionEvidence.submissionId, submissionId)).limit(1);
  if (!evidence) throw new Error("Add at least one evidence link before submitting.");
  await requireDatabase().update(projectSubmission).set({
    ...values,
    consentRecorded,
    integrityConfirmed,
    status: "submitted",
    submittedAt: new Date(),
  }).where(and(eq(projectSubmission.id, submissionId), eq(projectSubmission.status, "draft")));
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${submission.projectId}`);
  redirect(`/dashboard/projects/${submission.projectId}?submitted=1`);
}

"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessmentRole, employerTask, learnerProfile, platformSetting, user, verificationRequest } from "@/lib/database/schema";
import { transitionEmployerTask } from "@/features/employer-tasks/state";

export type EmployerTaskActionState = { error?: string; success?: string };

class TaskActionError extends Error {}

const taskIdSchema = z.string().min(1).max(100);

async function requireEligibleLearner(learnerId: string) {
  if (!db) throw new TaskActionError("Task invitations are temporarily unavailable.");
  const [profile] = await db.select({ id: learnerProfile.id }).from(learnerProfile)
    .innerJoin(user, eq(learnerProfile.userId, user.id))
    .innerJoin(verificationRequest, eq(verificationRequest.learnerId, user.id))
    .innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .where(and(
      eq(user.id, learnerId), eq(learnerProfile.discoverable, true),
      eq(user.role, "learner"), eq(user.disabled, false),
      eq(verificationRequest.status, "approved"), eq(verificationRequest.discoverable, true),
    )).limit(1);
  if (!profile) throw new TaskActionError("This learner is no longer discoverable for employer tasks.");
}

function actionFailure(error: unknown, fallback: string): EmployerTaskActionState {
  return { error: error instanceof TaskActionError ? error.message : fallback };
}

export async function createEmployerTask(_previous: EmployerTaskActionState, formData: FormData): Promise<EmployerTaskActionState> {
  const session = await requireRole(["employer"]);
  const parsed = z.object({
    learnerId: taskIdSchema,
    title: z.string().trim().min(4).max(120),
    skillArea: z.string().trim().min(2).max(100),
    instructions: z.string().trim().min(30).max(5000),
    criteria: z.string().trim().min(10).max(2000),
    dueAt: z.string().optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the required fields and length limits, then try again." };
  if (!db) return { error: "Task invitations are temporarily unavailable." };

  try {
    const [enabled] = await db.select({ value: platformSetting.value }).from(platformSetting)
      .where(eq(platformSetting.key, "employer_discovery_enabled")).limit(1);
    if (enabled?.value !== "true") throw new TaskActionError("Employer discovery and task invitations are currently paused.");
    await requireEligibleLearner(parsed.data.learnerId);
    const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
    if (dueAt && Number.isNaN(dueAt.getTime())) throw new TaskActionError("Choose a valid due date.");
    await db.insert(employerTask).values({
      id: crypto.randomUUID(), employerId: session.user.id, learnerId: parsed.data.learnerId,
      title: parsed.data.title, skillArea: parsed.data.skillArea, instructions: parsed.data.instructions,
      criteria: parsed.data.criteria, dueAt,
    });
    revalidatePath("/employer/tasks");
    return { success: "Invitation sent. The learner can accept or decline it from their workspace." };
  } catch (error) {
    return actionFailure(error, "We couldn’t send the invitation. Please try again.");
  }
}

export async function respondToEmployerTask(_previous: EmployerTaskActionState, formData: FormData): Promise<EmployerTaskActionState> {
  const session = await requireRole(["learner"]);
  const parsed = z.object({ taskId: taskIdSchema, decision: z.enum(["accepted", "declined"]) }).safeParse({
    taskId: formData.get("taskId"), decision: formData.get("decision"),
  });
  if (!parsed.success) return { error: "This task invitation is invalid. Refresh the page and try again." };
  if (!db) return { error: "Task invitations are temporarily unavailable." };

  try {
    const nextStatus = transitionEmployerTask("invited", parsed.data.decision === "accepted" ? "accept" : "decline");
    const [updated] = await db.update(employerTask)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(and(eq(employerTask.id, parsed.data.taskId), eq(employerTask.learnerId, session.user.id), eq(employerTask.status, "invited")))
      .returning({ id: employerTask.id });
    if (!updated) throw new TaskActionError("This invitation is unavailable or has already been answered.");
    revalidatePath("/dashboard/tasks");
    revalidatePath("/employer/tasks");
    return { success: parsed.data.decision === "accepted" ? "You accepted this invitation. You can submit your response when you’re ready." : "You declined this invitation." };
  } catch (error) {
    return actionFailure(error, "We couldn’t update this invitation. Refresh the page and try again.");
  }
}

export async function submitEmployerTask(_previous: EmployerTaskActionState, formData: FormData): Promise<EmployerTaskActionState> {
  const session = await requireRole(["learner"]);
  const parsed = z.object({
    taskId: taskIdSchema,
    learnerResponse: z.string().trim().min(30).max(5000),
    evidenceUrl: z.union([z.literal(""), z.string().url().max(2000)]).optional(),
  }).safeParse({ taskId: formData.get("taskId"), learnerResponse: formData.get("learnerResponse"), evidenceUrl: formData.get("evidenceUrl") });
  if (!parsed.success) return { error: "Add a response of at least 30 characters and check the evidence link." };
  if (parsed.data.evidenceUrl && !/^https?:\/\//i.test(parsed.data.evidenceUrl)) return { error: "Evidence links must use HTTPS or HTTP." };
  if (!db) return { error: "Task submissions are temporarily unavailable." };

  try {
    const nextStatus = transitionEmployerTask("accepted", "submit");
    const [updated] = await db.update(employerTask)
      .set({ status: nextStatus, learnerResponse: parsed.data.learnerResponse, evidenceUrl: parsed.data.evidenceUrl || null, updatedAt: new Date() })
      .where(and(eq(employerTask.id, parsed.data.taskId), eq(employerTask.learnerId, session.user.id), eq(employerTask.status, "accepted")))
      .returning({ id: employerTask.id });
    if (!updated) throw new TaskActionError("Accept this task before submitting your work.");
    revalidatePath("/dashboard/tasks");
    revalidatePath("/employer/tasks");
    return { success: "Your response was sent to the employer." };
  } catch (error) {
    return actionFailure(error, "We couldn’t submit your response. Please try again.");
  }
}

export async function reviewEmployerTask(_previous: EmployerTaskActionState, formData: FormData): Promise<EmployerTaskActionState> {
  const session = await requireRole(["employer"]);
  const parsed = z.object({ taskId: taskIdSchema, employerFeedback: z.string().trim().min(10).max(3000) }).safeParse({
    taskId: formData.get("taskId"), employerFeedback: formData.get("employerFeedback"),
  });
  if (!parsed.success) return { error: "Write feedback of at least 10 characters before sending." };
  if (!db) return { error: "Task feedback is temporarily unavailable." };

  try {
    const nextStatus = transitionEmployerTask("submitted", "review");
    const [updated] = await db.update(employerTask)
      .set({ status: nextStatus, employerFeedback: parsed.data.employerFeedback, updatedAt: new Date() })
      .where(and(eq(employerTask.id, parsed.data.taskId), eq(employerTask.employerId, session.user.id), eq(employerTask.status, "submitted")))
      .returning({ id: employerTask.id });
    if (!updated) throw new TaskActionError("Only your submitted tasks can be reviewed.");
    revalidatePath("/employer/tasks");
    revalidatePath("/dashboard/tasks");
    return { success: "Feedback sent to the learner." };
  } catch (error) {
    return actionFailure(error, "We couldn’t send feedback. Please try again.");
  }
}

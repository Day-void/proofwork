"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessmentRole, roleChallenge, rubricCriterion, rubricVersion } from "@/lib/database/schema";

function requireDatabase() {
  if (!db) throw new Error("The database is not configured.");
  return db;
}

function invalidate() {
  revalidatePath("/admin");
  revalidatePath("/admin/roles");
}

export async function saveRoleDraft(formData: FormData) {
  await requireRole(["admin"]);
  const database = requireDatabase();
  const { roleId, title, targetLevel, description, challengeId, brief, acceptanceCriteria } = z.object({
    roleId: z.string().min(1).max(100),
    title: z.string().trim().min(3).max(100),
    targetLevel: z.string().trim().min(2).max(80),
    description: z.string().trim().min(20).max(1500),
    challengeId: z.string().min(1).max(100),
    brief: z.string().trim().min(50).max(5000),
    acceptanceCriteria: z.string().trim().min(50).max(5000),
  }).parse({
    roleId: formData.get("roleId"), title: formData.get("title"), targetLevel: formData.get("targetLevel"),
    description: formData.get("description"), challengeId: formData.get("challengeId"),
    brief: formData.get("brief"), acceptanceCriteria: formData.get("acceptanceCriteria"),
  });
  const [role] = await database.select().from(assessmentRole).where(eq(assessmentRole.id, roleId)).limit(1);
  const [challenge] = await database.select().from(roleChallenge)
    .where(and(eq(roleChallenge.id, challengeId), eq(roleChallenge.roleId, roleId), eq(roleChallenge.status, "draft"))).limit(1);
  if (!role || role.active || !challenge) throw new Error("Only an unpublished role and its draft challenge can be edited.");
  await database.update(assessmentRole).set({ title, targetLevel, description }).where(eq(assessmentRole.id, roleId));
  await database.update(roleChallenge).set({ title: `${title} · Role Challenge`, brief, acceptanceCriteria })
    .where(eq(roleChallenge.id, challengeId));
  invalidate();
  redirect("/admin/roles?saved=1");
}

export async function saveRubricDraft(formData: FormData) {
  await requireRole(["admin"]);
  const database = requireDatabase();
  const values = z.object({
    criterionId: z.string().min(1).max(100),
    title: z.string().trim().min(3).max(140),
    description: z.string().trim().min(20).max(1500),
    evidenceGuidance: z.string().trim().min(20).max(1500),
    developingAnchor: z.string().trim().min(10).max(1000),
    meetsAnchor: z.string().trim().min(10).max(1000),
    strongAnchor: z.string().trim().min(10).max(1000),
  }).parse({
    criterionId: formData.get("criterionId"), title: formData.get("title"), description: formData.get("description"),
    evidenceGuidance: formData.get("evidenceGuidance"), developingAnchor: formData.get("developingAnchor"),
    meetsAnchor: formData.get("meetsAnchor"), strongAnchor: formData.get("strongAnchor"),
  });
  const [criterion] = await database.select({ criterion: rubricCriterion, versionStatus: rubricVersion.status })
    .from(rubricCriterion).innerJoin(rubricVersion, eq(rubricCriterion.rubricVersionId, rubricVersion.id))
    .where(and(eq(rubricCriterion.id, values.criterionId), eq(rubricVersion.status, "draft"))).limit(1);
  if (!criterion) throw new Error("Only criteria in an unpublished rubric can be edited.");
  await database.update(rubricCriterion).set({
    title: values.title,
    description: values.description,
    evidenceGuidance: values.evidenceGuidance,
    developingAnchor: values.developingAnchor,
    meetsAnchor: values.meetsAnchor,
    strongAnchor: values.strongAnchor,
  }).where(eq(rubricCriterion.id, values.criterionId));
  invalidate();
  redirect("/admin/roles?saved=1");
}

export async function publishRubricDraft(formData: FormData) {
  await requireRole(["admin"]);
  const database = requireDatabase();
  const rubricVersionId = z.string().min(1).max(100).parse(formData.get("rubricVersionId"));
  const [rubric] = await database.select().from(rubricVersion).where(and(
    eq(rubricVersion.id, rubricVersionId), eq(rubricVersion.status, "draft"),
  )).limit(1);
  if (!rubric) throw new Error("Draft rubric not found.");
  const [criteriaCount] = await database.select({ value: count() }).from(rubricCriterion)
    .where(eq(rubricCriterion.rubricVersionId, rubricVersionId));
  if ((criteriaCount?.value ?? 0) < 5) throw new Error("A rubric needs at least five criteria before it can be published.");
  const [existing] = await database.select({ id: rubricVersion.id }).from(rubricVersion)
    .where(and(eq(rubricVersion.roleId, rubric.roleId), eq(rubricVersion.status, "published"))).limit(1);
  if (existing) throw new Error("Create a new rubric version before replacing a published rubric.");
  await database.update(rubricVersion).set({ status: "published", publishedAt: new Date() })
    .where(eq(rubricVersion.id, rubricVersionId));
  invalidate();
  redirect("/admin/roles?rubricPublished=1");
}

export async function publishChallengeDraft(formData: FormData) {
  await requireRole(["admin"]);
  const database = requireDatabase();
  const challengeId = z.string().min(1).max(100).parse(formData.get("challengeId"));
  const [challenge] = await database.select().from(roleChallenge).where(and(
    eq(roleChallenge.id, challengeId), eq(roleChallenge.status, "draft"),
  )).limit(1);
  if (!challenge) throw new Error("Draft challenge not found.");
  const [rubric] = await database.select({ id: rubricVersion.id }).from(rubricVersion)
    .where(and(eq(rubricVersion.roleId, challenge.roleId), eq(rubricVersion.status, "published"))).limit(1);
  if (!rubric) throw new Error("Publish the role rubric before publishing its challenge.");
  await database.update(roleChallenge).set({ status: "published", publishedAt: new Date() })
    .where(eq(roleChallenge.id, challengeId));
  invalidate();
  redirect("/admin/roles?challengePublished=1");
}

export async function activateAssessmentRole(formData: FormData) {
  await requireRole(["admin"]);
  const database = requireDatabase();
  const roleId = z.string().min(1).max(100).parse(formData.get("roleId"));
  const [publishedRubric] = await database.select({ id: rubricVersion.id }).from(rubricVersion)
    .where(and(eq(rubricVersion.roleId, roleId), eq(rubricVersion.status, "published"))).limit(1);
  const [publishedChallenge] = await database.select({ id: roleChallenge.id }).from(roleChallenge)
    .where(and(eq(roleChallenge.roleId, roleId), eq(roleChallenge.status, "published"))).limit(1);
  if (!publishedRubric || !publishedChallenge) throw new Error("A published rubric and role challenge are required to activate this role.");
  await database.update(assessmentRole).set({ active: true }).where(eq(assessmentRole.id, roleId));
  invalidate();
  redirect("/admin/roles?roleActivated=1");
}

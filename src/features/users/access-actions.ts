"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { workspaceAccessRequest } from "@/lib/database/schema";

export async function requestWorkspaceAccess(formData: FormData) {
  const session = await requireRole(["learner"]);
  const values = z.object({
    requestedRole: z.enum(["employer", "assessor"]),
    organization: z.string().trim().max(160),
    reason: z.string().trim().min(20).max(2000),
  }).parse({
    requestedRole: formData.get("requestedRole"),
    organization: formData.get("organization") ?? "",
    reason: formData.get("reason"),
  });
  if (!db) throw new Error("The database is not configured.");
  const [created] = await db.insert(workspaceAccessRequest).values({
    id: crypto.randomUUID(), userId: session.user.id, ...values,
  }).onConflictDoNothing().returning({ id: workspaceAccessRequest.id });
  if (created) {
    revalidatePath("/admin/users");
  }
}

export async function reviewWorkspaceAccessRequest(formData: FormData) {
  const actor = await requireRole(["admin"]);
  const values = z.object({ requestId: z.string().min(1).max(100), decision: z.enum(["approved", "declined"]) }).parse({
    requestId: formData.get("requestId"), decision: formData.get("decision"),
  });
  if (!db) throw new Error("The database is not configured.");
  const [request] = await db.select().from(workspaceAccessRequest).where(and(
    eq(workspaceAccessRequest.id, values.requestId), eq(workspaceAccessRequest.status, "pending"),
  )).limit(1);
  if (!request) throw new Error("This access request is no longer pending.");
  if (values.decision === "approved") {
    const result = await db.execute(sql`
      WITH approved AS (
        UPDATE workspace_access_request
        SET status = 'approved', reviewed_by = ${actor.user.id}, reviewed_at = now()
        WHERE id = ${request.id} AND status = 'pending'
        RETURNING id, user_id, requested_role
      )
      , promoted AS (
        UPDATE "user" AS account
        SET role = approved.requested_role, updated_at = now()
        FROM approved
        WHERE account.id = approved.user_id
        RETURNING account.id, approved.id AS request_id, approved.requested_role
      )
      , revoked AS (
        DELETE FROM "session" WHERE user_id = (SELECT id FROM promoted)
        RETURNING id
      )
      , logged AS (
        INSERT INTO audit_log (id, actor_id, action, target_type, target_id, details)
        SELECT ${crypto.randomUUID()}, ${actor.user.id}, 'workspace_access_approved', 'workspace_access_request', promoted.request_id,
          jsonb_build_object('requestedRole', promoted.requested_role, 'userId', promoted.id)
        FROM promoted
        RETURNING id
      )
      SELECT promoted.id FROM promoted JOIN logged ON true
    `);
    if (!result.rowCount) throw new Error("This request was already reviewed or the applicant no longer exists.");
  } else {
    const result = await db.execute(sql`
      WITH declined AS (
        UPDATE workspace_access_request
        SET status = 'declined', reviewed_by = ${actor.user.id}, reviewed_at = now()
        WHERE id = ${request.id} AND status = 'pending'
        RETURNING id, user_id, requested_role
      ), logged AS (
        INSERT INTO audit_log (id, actor_id, action, target_type, target_id, details)
        SELECT ${crypto.randomUUID()}, ${actor.user.id}, 'workspace_access_declined', 'workspace_access_request', declined.id,
          jsonb_build_object('requestedRole', declined.requested_role, 'userId', declined.user_id)
        FROM declined
        RETURNING id
      )
      SELECT declined.id FROM declined JOIN logged ON true
    `);
    if (!result.rowCount) throw new Error("This request was already reviewed.");
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?accessRequestUpdated=1");
}

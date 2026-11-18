"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { auditLog, platformSetting, session as authSession, user, userRoles } from "@/lib/database/schema";

function database() {
  if (!db) throw new Error("The database is not configured.");
  return db;
}

export async function updateUserRole(formData: FormData) {
  const actor = await requireRole(["admin"]);
  const values = z.object({ userId: z.string().min(1).max(100), role: z.enum(userRoles) }).parse({ userId: formData.get("userId"), role: formData.get("role") });
  if (values.userId === actor.user.id && values.role !== "admin") throw new Error("You cannot remove your own administrator role.");
  const store = database();
  const [target] = await store.select({ id: user.id, role: user.role }).from(user).where(eq(user.id, values.userId)).limit(1);
  if (!target) throw new Error("User not found.");
  await store.update(user).set({ role: values.role, updatedAt: new Date() }).where(eq(user.id, values.userId));
  await store.delete(authSession).where(eq(authSession.userId, values.userId));
  await store.insert(auditLog).values({ id: crypto.randomUUID(), actorId: actor.user.id, action: "user_role_updated", targetType: "user", targetId: values.userId, details: { oldRole: target.role, newRole: values.role } });
  revalidatePath("/admin/users");
  redirect("/admin/users?updated=1");
}

export async function toggleUserAccess(formData: FormData) {
  const actor = await requireRole(["admin"]);
  const userId = z.string().min(1).max(100).parse(formData.get("userId"));
  if (userId === actor.user.id) throw new Error("You cannot disable your own account.");
  const store = database();
  const [target] = await store.select({ id: user.id, disabled: user.disabled }).from(user).where(eq(user.id, userId)).limit(1);
  if (!target) throw new Error("User not found.");
  const disabled = !target.disabled;
  await store.update(user).set({ disabled, updatedAt: new Date() }).where(eq(user.id, userId));
  if (disabled) await store.delete(authSession).where(eq(authSession.userId, userId));
  await store.insert(auditLog).values({ id: crypto.randomUUID(), actorId: actor.user.id, action: disabled ? "user_access_disabled" : "user_access_enabled", targetType: "user", targetId: userId, details: {} });
  revalidatePath("/admin/users");
  redirect("/admin/users?updated=1");
}

export async function savePlatformSetting(formData: FormData) {
  const actor = await requireRole(["admin"]);
  const values = z.object({
    key: z.enum(["employer_discovery_enabled", "ai_analysis_enabled", "new_assessments_enabled"]),
    value: z.enum(["true", "false"]),
  }).parse({ key: formData.get("key"), value: formData.get("value") });
  const store = database();
  await store.insert(platformSetting).values({ key: values.key, value: values.value, updatedBy: actor.user.id, updatedAt: new Date() })
    .onConflictDoUpdate({ target: platformSetting.key, set: { value: values.value, updatedBy: actor.user.id, updatedAt: new Date() } });
  await store.insert(auditLog).values({ id: crypto.randomUUID(), actorId: actor.user.id, action: "platform_setting_updated", targetType: "platform_setting", targetId: values.key, details: { value: values.value } });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

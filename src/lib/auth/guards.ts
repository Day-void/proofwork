import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/database/schema";
import { db } from "@/lib/database";
import { user } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

const workspaceForRole: Record<UserRole, string> = {
  learner: "/dashboard",
  assessor: "/assessor",
  moderator: "/assessor",
  admin: "/admin",
  employer: "/employer",
};

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  if (db) {
    const [account] = await db.select({ disabled: user.disabled }).from(user).where(eq(user.id, session.user.id)).limit(1);
    if (account?.disabled) redirect("/login?disabled=1");
  }

  const role = (session.user.role || "learner") as UserRole;
  if (!allowedRoles.includes(role)) redirect(workspaceForRole[role] ?? "/dashboard");

  return session;
}

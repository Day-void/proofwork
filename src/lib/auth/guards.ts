import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/database/schema";

const workspaceForRole: Record<UserRole, string> = {
  learner: "/dashboard",
  assessor: "/assessor",
  moderator: "/assessor",
  admin: "/admin",
};

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const role = (session.user.role || "learner") as UserRole;
  if (!allowedRoles.includes(role)) redirect(workspaceForRole[role] ?? "/dashboard");

  return session;
}

import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { BadgeCheck, BookOpenCheck, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessorReview, user, verificationRequest } from "@/lib/database/schema";
export const metadata: Metadata = { title: "Administration" };
export default async function AdminDashboardPage() {
  await requireRole(["admin"]);
  if (!db) return <DashboardShell kind="admin" />;
  const [[learnerCount], [reviewCount], [verifiedCount]] = await Promise.all([
    db.select({ value: count() }).from(user).where(eq(user.role, "learner")),
    db.select({ value: count() }).from(assessorReview).where(eq(assessorReview.status, "in_progress")),
    db.select({ value: count() }).from(verificationRequest).where(eq(verificationRequest.status, "approved")),
  ]);
  const metrics = [
    { label: "Learners", value: String(learnerCount?.value ?? 0), note: "Registered learner accounts", icon: Users },
    { label: "Reviews underway", value: String(reviewCount?.value ?? 0), note: "Conflict-cleared assessor reviews", icon: BookOpenCheck },
    { label: "Verified reports", value: String(verifiedCount?.value ?? 0), note: "Approved by a human reviewer", icon: BadgeCheck },
  ];
  return <DashboardShell kind="admin" metricsOverride={metrics} />;
}

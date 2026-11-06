import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";
export const metadata: Metadata = { title: "Learner workspace" };
export default async function LearnerDashboardPage() { await requireRole(["learner"]); return <DashboardShell kind="learner" />; }

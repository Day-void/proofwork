import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";
export const metadata: Metadata = { title: "Assessor workspace" };
export default async function AssessorDashboardPage() { await requireRole(["assessor", "moderator"]); return <DashboardShell kind="assessor" />; }

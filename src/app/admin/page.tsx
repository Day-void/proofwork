import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";
export const metadata: Metadata = { title: "Administration" };
export default async function AdminDashboardPage() { await requireRole(["admin"]); return <DashboardShell kind="admin" />; }

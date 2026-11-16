import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { auditLog, user } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditLogPage() {
  await requireRole(["admin"]);
  if (!db) return <main className="p-8">The database is not configured.</main>;
  const entries = await db.select({ event: auditLog, actorName: user.name, actorEmail: user.email }).from(auditLog)
    .leftJoin(user, eq(auditLog.actorId, user.id)).orderBy(desc(auditLog.createdAt)).limit(200);
  return <main className="min-h-screen bg-surface-50 px-5 py-10 text-navy-950 sm:px-8"><div className="mx-auto max-w-5xl"><h1 className="text-3xl font-semibold">Audit log</h1><p className="mt-2 text-sm text-surface-600">Recent administrative, moderation, sharing, and access changes.</p><ol className="mt-7 space-y-3">{entries.map(({ event, actorName, actorEmail }) => <li key={event.id} className="rounded-lg border border-surface-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><Badge variant="secondary">{event.action.replaceAll("_", " ")}</Badge><time className="text-xs text-surface-500">{event.createdAt.toLocaleString()}</time></div><p className="mt-2 text-xs text-surface-600">{actorName ?? "System or deleted user"}{actorEmail ? ` (${actorEmail})` : ""} · {event.targetType} {event.targetId}</p>{Object.keys(event.details).length > 0 && <pre className="mt-2 overflow-x-auto rounded bg-surface-50 p-2 text-[11px] text-surface-600">{JSON.stringify(event.details, null, 2)}</pre>}</li>)}</ol>{entries.length === 0 && <p className="mt-6 rounded-lg bg-white p-5 text-sm text-surface-500">No audit events recorded yet.</p>}</div></main>;
}

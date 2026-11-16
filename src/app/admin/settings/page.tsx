import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { savePlatformSetting } from "@/features/administration/actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { platformSetting } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Platform settings" };

const controls = [
  { key: "new_assessments_enabled", title: "Accept new assessments", text: "Allow learners to create new verification requests." },
  { key: "employer_discovery_enabled", title: "Employer discovery", text: "Show learner-opted-in verified profiles in the employer directory." },
  { key: "ai_analysis_enabled", title: "AI reviewer assistance", text: "Allow optional analysis jobs for requests where learners consented to sending their project text and ratings to OpenAI." },
] as const;

export default async function PlatformSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireRole(["admin"]);
  if (!db) return <main className="p-8">The database is not configured.</main>;
  const settings = await db.select().from(platformSetting);
  const current = new Map(settings.map((setting) => [setting.key, setting.value]));
  const query = await searchParams;
  return <main className="min-h-screen bg-surface-50 px-5 py-10 text-navy-950 sm:px-8"><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-semibold">Platform settings</h1><p className="mt-2 text-sm text-surface-600">Operational switches are stored in the database and changes are recorded in the audit log.</p>{query.saved && <p role="status" className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800">Setting saved.</p>}<div className="mt-7 space-y-3">{controls.map((control) => { const enabled = current.get(control.key) === "true"; return <section key={control.key} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-200 bg-white p-5"><div><h2 className="font-semibold">{control.title}</h2><p className="mt-1 text-sm text-surface-600">{control.text}</p></div><form action={savePlatformSetting} className="flex items-center gap-2"><input type="hidden" name="key" value={control.key} /><input type="hidden" name="value" value={enabled ? "false" : "true"} /><Badge variant="secondary" className={enabled ? "bg-emerald-50 text-emerald-800" : "bg-surface-100 text-surface-600"}>{enabled ? "On" : "Off"}</Badge><Button type="submit" size="sm" variant="outline">Turn {enabled ? "off" : "on"}</Button></form></section>; })}</div><p className="mt-4 text-xs text-surface-500">New assessments, employer discovery, and AI analysis are off unless explicitly enabled.</p></div></main>;
}

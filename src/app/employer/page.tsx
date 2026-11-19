import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, inArray } from "drizzle-orm";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessmentRole, learnerProfile, platformSetting, user, verificationRequest } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Discover verified talent" };

export default async function EmployerDirectoryPage() {
  await requireRole(["employer"]);
  if (!db) return <main className="p-8">The database is not configured.</main>;
  const [discoverySetting] = await db.select({ value: platformSetting.value }).from(platformSetting).where(eq(platformSetting.key, "employer_discovery_enabled")).limit(1);
  if (discoverySetting?.value !== "true") return <main className="min-h-screen bg-surface-50 px-5 py-12 text-navy-950"><div className="mx-auto max-w-3xl rounded-xl border border-surface-200 bg-white p-6"><h1 className="text-2xl font-semibold">Employer discovery is paused</h1><p className="mt-2 text-sm text-surface-600">ProofWork has temporarily paused the discoverable profile directory.</p></div></main>;
  const profiles = await db.select({ profile: learnerProfile, learner: user }).from(learnerProfile)
    .innerJoin(user, eq(learnerProfile.userId, user.id)).where(and(
      eq(learnerProfile.discoverable, true), eq(user.role, "learner"), eq(user.disabled, false),
    ));
  const requests = profiles.length ? await db.select({ request: verificationRequest, role: assessmentRole })
    .from(verificationRequest).innerJoin(assessmentRole, eq(verificationRequest.roleId, assessmentRole.id))
    .where(and(inArray(verificationRequest.learnerId, profiles.map(({ learner }) => learner.id)), eq(verificationRequest.status, "approved"), eq(verificationRequest.discoverable, true)))
    .orderBy(asc(assessmentRole.title)) : [];
  const verifiedRoles = new Map<string, string[]>();
  for (const item of requests) {
    const values = verifiedRoles.get(item.request.learnerId) ?? [];
    values.push(item.role.title);
    verifiedRoles.set(item.request.learnerId, values);
  }
  const visible = profiles.filter(({ learner }) => verifiedRoles.has(learner.id));
  return <main className="min-h-screen bg-surface-50 text-navy-950"><WorkspaceHeader kind="employer" label="Employer access" /><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><Badge variant="secondary" className="bg-accent-50 text-accent-800">Employer access</Badge><h1 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Discover verified skills</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-surface-600">Only learners who opted into profile discovery and shared a verified role appear here. Email addresses, submissions, and assessor notes stay private.</p></div><Button asChild variant="outline"><Link href="/employer/tasks">Role tasks</Link></Button></div>
    {visible.length ? <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(({ profile, learner }) => <article key={profile.id} className="rounded-xl border border-surface-200 bg-white p-5"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-accent-50 text-accent-800"><BriefcaseBusiness size={19} /></span><Badge variant="secondary" className="bg-emerald-50 text-emerald-800"><BadgeCheck className="mr-1 size-3" /> Verified</Badge></div><h2 className="mt-4 text-lg font-semibold">{learner.name}</h2>{profile.headline && <p className="mt-1 text-sm text-accent-800">{profile.headline}</p>}{profile.bio && <p className="mt-3 line-clamp-4 text-sm leading-6 text-surface-600">{profile.bio}</p>}<div className="mt-4 flex flex-wrap gap-2">{verifiedRoles.get(learner.id)?.map((role) => <Badge key={role} variant="outline">{role}</Badge>)}</div>{profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent-800 underline">Portfolio link<ArrowUpRight size={13} /></a>}</article>)}</div> : <div className="mt-7 rounded-xl border border-dashed border-surface-300 bg-white p-8 text-center"><h2 className="font-semibold">No discoverable profiles yet</h2><p className="mt-2 text-sm text-surface-600">Learners choose whether to appear here and which verified roles to include.</p></div>}
  </div></main>;
}

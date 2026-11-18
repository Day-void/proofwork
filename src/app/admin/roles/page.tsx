import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  activateAssessmentRole,
  publishChallengeDraft,
  publishRubricDraft,
  saveRoleDraft,
  saveRubricDraft,
} from "@/features/assessment/admin-actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessmentRole, roleChallenge, rubricCriterion, rubricVersion } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Assessment roles" };

function Field({ label, name, value, required = true, multiline = false }: {
  label: string; name: string; value: string; required?: boolean; multiline?: boolean;
}) {
  const className = "mt-1.5 w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-navy-950 outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100";
  return <label className="block text-sm font-medium text-navy-800">{label}{multiline
    ? <textarea className={`${className} min-h-24 resize-y leading-6`} name={name} defaultValue={value} required={required} />
    : <input className={className} name={name} defaultValue={value} required={required} />}</label>;
}

export default async function AssessmentRolesPage() {
  await requireRole(["admin"]);
  if (!db) {
    return <main className="min-h-screen bg-surface-50 px-5 py-12 text-navy-950"><div className="mx-auto max-w-3xl rounded-xl border border-surface-200 bg-white p-6"><h1 className="text-xl font-semibold">Assessment roles</h1><p className="mt-2 text-sm text-surface-600">The database is not configured, so role setup is unavailable.</p></div></main>;
  }

  const roles = await db.select().from(assessmentRole).orderBy(asc(assessmentRole.title));
  const roleData = await Promise.all(roles.map(async (role) => {
    const rubrics = await db!.select().from(rubricVersion).where(eq(rubricVersion.roleId, role.id)).orderBy(asc(rubricVersion.version));
    const challenges = await db!.select().from(roleChallenge).where(eq(roleChallenge.roleId, role.id)).orderBy(asc(roleChallenge.version));
    const rubricDetails = await Promise.all(rubrics.map(async (rubric) => ({
      rubric,
      criteria: await db!.select().from(rubricCriterion).where(eq(rubricCriterion.rubricVersionId, rubric.id)).orderBy(asc(rubricCriterion.sortOrder)),
    })));
    return { role, rubricDetails, challenges };
  }));

  return <main className="min-h-screen bg-surface-50 text-navy-950">
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-navy-950"><ArrowLeft size={16} /> Administration</Link>
      <div className="mt-6 max-w-3xl"><Badge variant="secondary" className="bg-accent-50 text-accent-800">Assessment setup</Badge><h1 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Role catalog and rubrics</h1><p className="mt-3 text-sm leading-6 text-surface-600">Review the draft role, competency anchors, and practice challenge. A rubric must be published before its challenge, and both must be published before learners can select the role.</p></div>
      {roleData.length === 0 && <section className="mt-8 rounded-xl border border-surface-200 bg-white p-6"><h2 className="font-semibold">No assessment roles yet</h2><p className="mt-2 text-sm text-surface-600">Apply the assessment seed migration to create the initial role draft.</p></section>}
      <div className="mt-8 space-y-6">{roleData.map(({ role, rubricDetails, challenges }) => <article key={role.id} className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-subtle">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-200 px-5 py-5 sm:px-6"><div><h2 className="text-xl font-semibold">{role.title}</h2><p className="mt-1 text-sm text-surface-600">{role.targetLevel} · <span className="font-mono text-xs">{role.slug}</span></p></div><Badge variant="secondary" className={role.active ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}>{role.active ? "Active" : "Draft role"}</Badge></header>
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[.8fr_1.2fr]">
          <section><h3 className="text-sm font-semibold">Role details</h3><form action={saveRoleDraft} className="mt-4 space-y-4"><input type="hidden" name="roleId" value={role.id} /><input type="hidden" name="challengeId" value={challenges.find((item) => item.status === "draft")?.id ?? "missing"} /><Field label="Role title" name="title" value={role.title} /><Field label="Target level" name="targetLevel" value={role.targetLevel} /><Field label="Description" name="description" value={role.description} multiline /><Field label="Challenge brief" name="brief" value={challenges.find((item) => item.status === "draft")?.brief ?? "No draft challenge"} multiline /><Field label="Acceptance criteria" name="acceptanceCriteria" value={challenges.find((item) => item.status === "draft")?.acceptanceCriteria ?? "No draft challenge"} multiline /><Button type="submit" disabled={role.active || !challenges.some((item) => item.status === "draft")} className="bg-navy-900 text-white hover:bg-navy-800">Save role and challenge draft</Button></form></section>
          <section><h3 className="text-sm font-semibold">Rubric versions</h3><div className="mt-4 space-y-4">{rubricDetails.map(({ rubric, criteria }) => <div key={rubric.id} className="rounded-lg border border-surface-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-semibold">{rubric.title}</h4><p className="mt-1 text-xs text-surface-500">Version {rubric.version} · {criteria.length} criteria</p></div><StatusBadge status={rubric.status} /></div>
            {rubric.status === "draft" && <div className="mt-4 space-y-3">{criteria.map((criterion) => <details key={criterion.id} className="rounded-md bg-surface-50 p-3"><summary className="cursor-pointer text-sm font-medium">{criterion.sortOrder}. {criterion.title}</summary><form action={saveRubricDraft} className="mt-3 space-y-3"><input type="hidden" name="criterionId" value={criterion.id} /><Field label="Title" name="title" value={criterion.title} /><Field label="Description" name="description" value={criterion.description} multiline /><Field label="Evidence guidance" name="evidenceGuidance" value={criterion.evidenceGuidance} multiline /><Field label="Developing" name="developingAnchor" value={criterion.developingAnchor} multiline /><Field label="Meets expectations" name="meetsAnchor" value={criterion.meetsAnchor} multiline /><Field label="Strong" name="strongAnchor" value={criterion.strongAnchor} multiline /><Button type="submit" size="sm" variant="outline">Save criterion</Button></form></details>)}
              <form action={publishRubricDraft}><input type="hidden" name="rubricVersionId" value={rubric.id} /><Button type="submit" disabled={criteria.length < 5} className="bg-navy-900 text-white hover:bg-navy-800">Publish rubric</Button></form></div>}
            {rubric.status === "published" && <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-800"><CheckCircle2 size={14} /> Published rubric</p>}
          </div>)}</div>
          <h3 className="mt-6 text-sm font-semibold">Role challenges</h3><div className="mt-3 space-y-3">{challenges.map((challenge) => <div key={challenge.id} className="rounded-lg border border-surface-200 p-4"><div className="flex items-center justify-between gap-2"><h4 className="text-sm font-semibold">{challenge.title}</h4><StatusBadge status={challenge.status} /></div><p className="mt-2 text-xs leading-5 text-surface-600">{challenge.brief}</p>{challenge.status === "draft" && <form action={publishChallengeDraft} className="mt-3"><input type="hidden" name="challengeId" value={challenge.id} /><Button type="submit" size="sm" variant="outline">Publish challenge</Button></form>}</div>)}</div>
          {role.active ? <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-800"><CheckCircle2 size={16} /> Learners can select this role.</p> : <form action={activateAssessmentRole} className="mt-5"><input type="hidden" name="roleId" value={role.id} /><Button type="submit" variant="outline" disabled={!rubricDetails.some(({ rubric }) => rubric.status === "published") || !challenges.some((item) => item.status === "published")}><CircleDashed className="mr-2 size-4" />Activate role</Button></form>}
          </section>
        </div>
      </article>)}</div>
    </div>
  </main>;
}

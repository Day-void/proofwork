import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { submitCalibration } from "@/features/assessment/workflow-actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessorCalibration, assessmentRole, rubricCriterion, rubricVersion } from "@/lib/database/schema";

export const metadata: Metadata = { title: "Rubric calibration" };

const calibrationExamples: Record<string, string> = {
  "interface-implementation": "The page supports title search, topic and level filters, details, and a reset action. When filters produce no matches, the results area becomes blank; the user has no explanation or recovery hint.",
  "responsive-layout": "The experience is clear at desktop width. At 360px, the filter row keeps its desktop widths, causing horizontal page scroll and clipping the reset control.",
  "accessibility-fundamentals": "The detail view opens from a clickable card built with a div. It has no keyboard handler, accessible name, or focus management; all other visible buttons are labelled.",
  "code-structure": "The main page component owns search, filtering, details, and rendering. Similar workshop cards are duplicated in the featured and results sections, with consistent names and behavior.",
  "technical-reasoning": "The developer explains why filters are combined and describes one alternative. They cannot explain how the selected state is restored after closing details, and have not investigated it.",
  "testing-reliability": "The developer manually checked search and filtering with matching data. They did not check empty results, narrow screens, or keyboard interaction, and report no repeatable checks.",
};

export default async function RubricCalibrationPage({ params }: { params: Promise<{ rubricVersionId: string }> }) {
  const session = await requireRole(["assessor", "moderator"]);
  const { rubricVersionId } = await params;
  if (!db) return <main className="p-8">The database is not configured.</main>;
  const [data] = await db.select({ rubric: rubricVersion, roleTitle: assessmentRole.title }).from(rubricVersion)
    .innerJoin(assessmentRole, eq(rubricVersion.roleId, assessmentRole.id)).where(and(
      eq(rubricVersion.id, rubricVersionId), eq(rubricVersion.status, "published"), eq(assessmentRole.active, true),
    )).limit(1);
  if (!data) return <main className="p-8">This rubric is not available for calibration.</main>;
  const criteria = await db.select().from(rubricCriterion).where(eq(rubricCriterion.rubricVersionId, rubricVersionId)).orderBy(asc(rubricCriterion.sortOrder));
  const [existing] = await db.select().from(assessorCalibration).where(and(
    eq(assessorCalibration.assessorId, session.user.id), eq(assessorCalibration.rubricVersionId, rubricVersionId),
  )).limit(1);
  if (existing?.status === "approved") return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-semibold">Calibration approved</h1><p className="mt-2 text-sm text-surface-600">You are calibrated for this rubric version.</p><Link href="/assessor" className="mt-4 inline-flex text-sm underline">Return to assessor workspace</Link></main>;
  const answerByCriterion = new Map((existing?.answers ?? []).map((answer) => [answer.criterionId, answer]));
  return <main className="min-h-screen bg-surface-50 text-navy-950"><div className="mx-auto max-w-4xl px-5 py-10 sm:px-8"><Link href="/assessor" className="inline-flex items-center gap-2 text-sm font-medium text-surface-600"><ArrowLeft size={16} /> Assessor workspace</Link>
    <div className="mt-6"><Badge variant="secondary" className="bg-accent-50 text-accent-800">Calibration exercise</Badge><h1 className="mt-3 text-3xl font-semibold tracking-[-.045em]">{data.roleTitle}: {data.rubric.title}</h1><p className="mt-2 text-sm leading-6 text-surface-600">For each competency, choose the anchor that best represents the example level and explain your reasoning. A moderator or administrator will review your calibration before you receive assignments.</p></div>
    {existing?.reviewerNote && <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm"><strong>Reviewer feedback:</strong> {existing.reviewerNote}</p>}
    <form action={submitCalibration} className="mt-6 space-y-5"><input type="hidden" name="rubricVersionId" value={rubricVersionId} />
      {criteria.map((criterion) => { const answer = answerByCriterion.get(criterion.id); return <fieldset key={criterion.id} className="rounded-xl border border-surface-200 bg-white p-5"><legend className="px-1 text-base font-semibold">{criterion.sortOrder}. {criterion.title}</legend><p className="mt-2 text-sm leading-6 text-surface-600">{criterion.description}</p><div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-blue-900">Shared calibration example</p><p className="mt-1 text-sm leading-6 text-blue-950">{calibrationExamples[criterion.criterionKey] ?? "A sample performance has been provided for this competency. Compare its observable behavior with the rubric anchors."}</p></div><div className="mt-4 grid gap-2 md:grid-cols-3">{([{ value: "developing", label: "Developing", text: criterion.developingAnchor }, { value: "meets_expectations", label: "Meets expectations", text: criterion.meetsAnchor }, { value: "strong", label: "Strong", text: criterion.strongAnchor }] as const).map((option) => <label key={option.value} className="flex cursor-pointer gap-2 rounded-lg border border-surface-200 p-3 text-xs leading-5 has-[:checked]:border-accent-600 has-[:checked]:bg-accent-50"><input type="radio" name={`rating:${criterion.id}`} value={option.value} defaultChecked={answer?.rating === option.value} required className="mt-0.5 accent-teal-700" /><span><strong className="block text-navy-900">{option.label}</strong><span className="text-surface-600">{option.text}</span></span></label>)}</div><label className="mt-4 block text-sm font-medium">Which evidence in the example supports your rating?<textarea name={`rationale:${criterion.id}`} required minLength={20} maxLength={1000} defaultValue={answer?.rationale ?? ""} className="mt-1.5 min-h-24 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="Cite the behavior and explain how it relates to the neighboring anchors." /></label></fieldset>; })}
      <label className="block rounded-xl border border-surface-200 bg-white p-5 text-sm font-medium">Calibration note (optional)<textarea name="assessorNote" maxLength={2000} defaultValue={existing?.assessorNote ?? ""} className="mt-1.5 min-h-20 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="Questions or assumptions for the reviewer." /></label>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-xl text-xs leading-5 text-surface-500">This exercise checks interpretation of the published anchors; there is no automatic score. A human reviewer will provide calibration feedback.</p><Button type="submit" className="bg-navy-900 text-white hover:bg-navy-800">Submit calibration</Button></div>
    </form>
  </div></main>;
}

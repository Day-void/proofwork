import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth/guards";
import { createProject } from "@/features/submissions/actions";

export const metadata: Metadata = { title: "Create a project" };

export default async function NewProjectPage() {
  await requireRole(["learner"]);
  return <main className="min-h-screen bg-surface-50 px-5 py-10 text-navy-950 sm:px-8 sm:py-14">
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-navy-900"><ArrowLeft size={16} /> Back to workspace</Link>
      <div className="mt-7 rounded-2xl border border-surface-200 bg-white p-6 shadow-subtle sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-[.16em] text-accent-700">Learner portfolio</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Add a project</h1>
        <p className="mt-2 text-sm leading-6 text-surface-600">Start with one piece of work you are proud of. You can add the story, process, and evidence after this first step.</p>
        <form action={createProject} className="mt-7 space-y-5">
          <div className="space-y-2"><Label htmlFor="title">What should we call this project?</Label><Input id="title" name="title" maxLength={100} minLength={3} placeholder="For example, Community marketplace" required /></div>
          <div className="space-y-2"><Label htmlFor="skillArea">Which skill does this show best?</Label><Input id="skillArea" name="skillArea" maxLength={80} placeholder="For example, Frontend development" required /></div>
          <div className="space-y-2"><Label htmlFor="summary">What did you build, and who was it for?</Label><p className="text-xs leading-5 text-surface-500">A short context paragraph helps an assessor understand the work before they open the evidence.</p><textarea id="summary" name="summary" rows={4} minLength={20} maxLength={800} required placeholder="Describe the problem, who it helps, and what you made." className="flex w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm leading-6 text-navy-950 shadow-sm outline-none placeholder:text-surface-400 focus-visible:ring-2 focus-visible:ring-accent-500" /></div>
          <div className="flex flex-col-reverse gap-3 border-t border-surface-100 pt-5 sm:flex-row sm:justify-end"><Button asChild variant="outline"><Link href="/dashboard">Cancel</Link></Button><Button type="submit" className="bg-navy-900 text-white hover:bg-navy-800"><Plus className="mr-1.5 size-4" /> Create project</Button></div>
        </form>
      </div>
    </div>
  </main>;
}

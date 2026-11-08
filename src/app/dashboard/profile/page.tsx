import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { learnerProfile } from "@/lib/database/schema";
import { saveLearnerProfile } from "@/features/submissions/actions";

export const metadata: Metadata = { title: "Learner profile" };

export default async function LearnerProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await requireRole(["learner"]);
  if (!db) throw new Error("The learner profile requires a configured database.");
  const [profile] = await db.select().from(learnerProfile).where(eq(learnerProfile.userId, session.user.id)).limit(1);
  const params = await searchParams;
  return <main className="min-h-screen bg-surface-50 px-5 py-10 text-navy-950 sm:px-8 sm:py-14">
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-navy-900"><ArrowLeft size={16} /> Back to workspace</Link>
      <div className="mt-7 rounded-2xl border border-surface-200 bg-white p-6 shadow-subtle sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-[.16em] text-accent-700">Learner profile</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Tell assessors about your work</h1>
        <p className="mt-2 text-sm leading-6 text-surface-600">This profile gives context to your projects. Your email remains private.</p>
        {params.saved === "1" && <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-800"><CheckCircle2 size={17} /> Profile saved.</p>}
        <form action={saveLearnerProfile} className="mt-7 space-y-5">
          <div className="space-y-2"><Label htmlFor="name">Account name</Label><Input id="name" value={session.user.name} readOnly /></div>
          <div className="space-y-2"><Label htmlFor="headline">Professional headline</Label><Input id="headline" name="headline" defaultValue={profile?.headline ?? ""} maxLength={100} placeholder="Frontend developer, learning through real projects" /></div>
          <div className="space-y-2"><Label htmlFor="bio">About you</Label><textarea id="bio" name="bio" rows={5} defaultValue={profile?.bio ?? ""} maxLength={1000} placeholder="Share your background, interests, and the kind of work you want to do." className="flex w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm leading-6 text-navy-950 shadow-sm outline-none placeholder:text-surface-400 focus-visible:ring-2 focus-visible:ring-accent-500" /></div>
          <div className="space-y-2"><Label htmlFor="portfolioUrl">Existing portfolio or professional profile</Label><Input id="portfolioUrl" name="portfolioUrl" type="url" defaultValue={profile?.portfolioUrl ?? ""} maxLength={500} placeholder="https://example.com" /></div>
          <div className="flex justify-end border-t border-surface-100 pt-5"><Button type="submit" className="bg-navy-900 text-white hover:bg-navy-800">Save profile</Button></div>
        </form>
      </div>
    </div>
  </main>;
}

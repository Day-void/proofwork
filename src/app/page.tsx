import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CircleDot,
  ClipboardCheck,
  Eye,
  FileCheck2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Layers3, title: "Show real work", text: "Create a project and explain the decisions and process behind it.", status: "Available now" },
  { icon: Target, title: "Take a role-based challenge", text: "Add a consistent task designed around the skills your chosen role requires.", status: "Planned" },
  { icon: ClipboardCheck, title: "Get an independent review", text: "A role-specific rubric connects each assessment to the evidence behind it.", status: "Planned" },
];

const competencies = ["Technical execution", "Problem solving", "Communication", "Accessibility", "Quality and reliability", "Role-specific practice"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-navy-950">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#f1f7ff]">
        <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(ellipse at 12% 5%, rgba(47,202,183,.18), transparent 34%), radial-gradient(ellipse at 86% 90%, rgba(85,145,215,.16), transparent 36%)" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[.95fr_1.05fr] lg:gap-14 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-700/10 bg-white/75 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-accent-800"><span className="size-1.5 rounded-full bg-accent-500" /> Evidence for practical skills</div>
            <h1 className="mt-6 text-balance text-4xl font-medium leading-[1.08] tracking-[-.05em] sm:text-[2.75rem] lg:text-[3.5rem]">Make your skills visible.<br /><span className="text-accent-700">Back them with proof.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-surface-600 sm:text-lg sm:leading-8">Build a portfolio around real projects, document how you work, and prepare for role-based skills verification.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-accent-400 px-6 font-semibold text-navy-950 hover:bg-accent-300"><Link href="/register">Create your portfolio <ArrowRight className="ml-2 size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-navy-200 bg-white/70 px-6 text-navy-900 hover:bg-white"><a href="#how-it-works">See how it works <ArrowDown className="ml-2 size-4" /></a></Button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-surface-600"><span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-accent-700" /> Private by default</span><span className="inline-flex items-center gap-2"><FileCheck2 size={16} className="text-accent-700" /> Evidence-led</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="relative min-h-[340px] overflow-hidden rounded-[1.75rem] bg-navy-900 shadow-elevated sm:min-h-[430px]">
              <Image src="/images/hero2.jpeg" alt="A developer working through a project on a laptop" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-[64%_38%]" priority />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/5 to-transparent" />
              <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-navy-950/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-white backdrop-blur sm:left-6 sm:top-6">Your work is the starting point</div>
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-accent-800">Illustrative assessment path</div><h2 className="mt-1 text-lg font-semibold tracking-tight">Frontend developer</h2></div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-800">Product preview</span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[{ label: "Portfolio", icon: BriefcaseBusiness }, { label: "Role challenge", icon: Target }, { label: "Human review", icon: ClipboardCheck }].map(({ label, icon: Icon }, index) => <div key={label} className="flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-50 text-accent-700"><Icon size={15} /></span><span className="min-w-0"><span className="block text-xs font-semibold text-navy-900">{label}</span><span className="block text-[10px] text-surface-500">{index === 0 ? "Your real work" : "Planned"}</span></span></div>)}
                </div>
                <p className="mt-3 text-[11px] leading-4 text-surface-500">A sample view of the portfolio, challenge, and human review journey.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative border-t border-navy-900/10 bg-white/65">
          <div className="mx-auto grid max-w-7xl gap-3 px-5 py-4 text-sm font-medium text-navy-800 sm:grid-cols-3 sm:px-8 sm:gap-6"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-accent-700" /> Private project workspace</div><div className="flex items-center gap-2"><CircleDot size={17} className="text-accent-700" /> Versioned submissions</div><div className="flex items-center gap-2"><FileCheck2 size={17} className="text-accent-700" /> Project evidence links</div></div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-800">A clearer path to proof</div><h2 className="mt-3 text-balance text-[2rem] font-medium leading-tight tracking-[-.04em] sm:text-[2.25rem]">Build from real work. Add a consistent test.</h2><p className="mt-4 text-base leading-7 text-surface-600">A portfolio shows how you work in context. A role-based task can make the skills easier to compare. A human review should explain what the evidence supports.</p></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{steps.map(({ icon: Icon, title, text, status }, index) => <article key={title} className="rounded-2xl border border-surface-200 bg-white p-5 shadow-subtle transition duration-200 hover:-translate-y-0.5 hover:border-accent-200 hover:shadow-elevated sm:p-6"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-accent-50 text-accent-800"><Icon size={21} /></span><span className="font-mono text-xs text-surface-400">0{index + 1}</span></div><div className={`mt-5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === "Available now" ? "bg-accent-50 text-accent-800" : "bg-surface-100 text-surface-600"}`}>{status}</div><h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-surface-600">{text}</p></article>)}</div>
        </div>
      </section>

      <section id="for-learners" className="scroll-mt-20 border-y border-surface-200 bg-[#f6faff] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-800">For learners</div><h2 className="mt-3 text-[2rem] font-medium leading-tight tracking-[-.04em] sm:text-[2.25rem]">Show the work behind your skills.</h2><p className="mt-4 text-base leading-7 text-surface-600">Start with projects you have already made. Describe your choices, add evidence links, and keep each submitted version intact.</p><Button asChild className="mt-6 bg-navy-900 text-white hover:bg-navy-800"><Link href="/register">Start your portfolio <ArrowRight className="ml-2 size-4" /></Link></Button></div>
          <div className="grid gap-3 sm:grid-cols-2">{[{ icon: FileCheck2, title: "Evidence stays connected", text: "Attach demos and repositories to the project they support." }, { icon: Eye, title: "Private by default", text: "Projects stay in your workspace until you choose to share a verified result." }, { icon: Layers3, title: "Keep your versions", text: "Submitted work stays as a record while revisions can become a new version." }, { icon: Sparkles, title: "Know what comes next", text: "The next step is a role-aligned challenge and an independent assessor review." }].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-xl border border-surface-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-accent-200 hover:shadow-subtle sm:p-5"><span className="grid size-9 place-items-center rounded-lg bg-accent-50 text-accent-800"><Icon size={18} /></span><h3 className="mt-3 text-sm font-semibold">{title}</h3><p className="mt-1.5 text-xs leading-5 text-surface-600">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-800">Role-specific, not one-size-fits-all</div><h2 className="mt-3 text-[2rem] font-medium leading-tight tracking-[-.04em] sm:text-[2.25rem]">A useful review looks at more than one skill.</h2><p className="mt-4 max-w-xl text-base leading-7 text-surface-600">The assessment model is being designed around role-relevant competencies. A future report should show the evidence and reasoning behind each rating, not just a single unexplained score.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800"><BadgeCheck size={15} /> Assessment framework in development</div></div>
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-subtle sm:p-7"><div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-surface-500">Example role lens</div><h3 className="mt-1 text-lg font-semibold">Frontend development</h3></div><span className="grid size-10 place-items-center rounded-xl bg-accent-50 text-accent-800"><Target size={20} /></span></div><ul className="mt-5 grid gap-2 sm:grid-cols-2">{competencies.map((item) => <li key={item} className="flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-2.5 text-sm text-navy-800"><Check size={15} className="shrink-0 text-accent-700" /> {item}</li>)}</ul><p className="mt-4 text-xs leading-5 text-surface-500">Example competencies only. The rubric and scoring standards still need to be defined and reviewed.</p></div>
        </div>
      </section>

      <section id="for-employers" className="scroll-mt-20 bg-navy-950 px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-center"><div className="max-w-2xl"><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-300">For employers</div><h2 className="mt-3 text-[2rem] font-medium leading-tight tracking-[-.04em] sm:text-[2.25rem]">See what a candidate can do—and why.</h2><p className="mt-4 text-base leading-7 text-white/70">ProofWork is planning learner-controlled profiles, evidence-linked competency ratings, and role-based assessments to make skills easier to understand.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-accent-200"><CircleDot size={14} /> Employer discovery is planned, not live</div></div><div className="grid gap-3 sm:grid-cols-3 lg:w-[430px] lg:grid-cols-1">{[{ title: "Role-relevant", text: "Assess the skills that matter for a role." }, { title: "Evidence-linked", text: "Trace each rating back to reviewed work." }, { title: "Learner-controlled", text: "Only see profiles a learner chooses to share." }].map(({ title, text }) => <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-white/60">{text}</p></div>)}</div></div>
      </section>

      <section id="for-assessors" className="scroll-mt-20 border-b border-surface-200 bg-white px-5 py-14 sm:px-8 sm:py-16"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div className="max-w-2xl"><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-800">For assessors</div><h2 className="mt-3 text-[2rem] font-medium leading-tight tracking-[-.04em] sm:text-[2.25rem]">Help make practical skills visible.</h2><p className="mt-3 text-base leading-7 text-surface-600">ProofWork’s review model is being built around clear criteria, evidence, independent judgment, and useful feedback.</p></div><Button asChild variant="outline" className="h-11 justify-self-start border-navy-200 px-5 text-navy-900 hover:bg-navy-50 lg:justify-self-end"><Link href="/assessor">Explore assessor workspace <ArrowUpRight className="ml-2 size-4" /></Link></Button></div></section>

      <section className="bg-accent-50 px-5 py-8 sm:px-8 sm:py-9"><div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-semibold uppercase tracking-[.16em] text-accent-800">Start with your work</div><h2 className="mt-1 text-xl font-semibold tracking-[-.03em] sm:text-2xl">Build a portfolio that can grow into proof.</h2></div><Button asChild className="h-11 bg-accent-400 px-5 font-semibold text-navy-950 hover:bg-accent-300"><Link href="/register">Create your portfolio <ArrowRight className="ml-2 size-4" /></Link></Button></div></section>

      <footer className="relative overflow-hidden bg-navy-950 px-5 text-white sm:px-8">
        <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(ellipse at 12% 100%, rgba(20,184,166,.22), transparent 42%), radial-gradient(ellipse at 90% 0%, rgba(65,110,192,.2), transparent 38%)" }} />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-x-8 gap-y-6 py-7 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.25fr] lg:gap-8 lg:py-8">
            <div className="max-w-xs"><Link href="/" className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400" aria-label="ProofWork home"><span className="grid size-9 place-items-center rounded-xl bg-accent-400 text-navy-950"><ShieldCheck size={20} strokeWidth={2.5} /></span><span className="text-lg font-semibold tracking-tight">proofwork<span className="text-accent-400">.</span></span></Link><p className="mt-3 text-sm leading-5 text-white/60">Trusted proof of what you can do, grounded in real work.</p></div>
            <nav aria-label="Explore ProofWork"><h2 className="text-sm font-semibold">Explore</h2><ul className="mt-3 space-y-2 text-sm text-white/60"><li><a className="transition hover:text-white" href="#how-it-works">How it works</a></li><li><a className="transition hover:text-white" href="#for-learners">For learners</a></li><li><a className="transition hover:text-white" href="#for-employers">For employers</a></li></ul></nav>
            <nav aria-label="Your account"><h2 className="text-sm font-semibold">Your account</h2><ul className="mt-3 space-y-2 text-sm text-white/60"><li><Link className="whitespace-nowrap transition hover:text-white" href="/login">Log in</Link></li><li><Link className="whitespace-nowrap transition hover:text-white" href="/register">Create your portfolio</Link></li><li><Link className="whitespace-nowrap transition hover:text-white" href="/forgot-password">Reset your password</Link></li></ul></nav>
            <div><h2 className="text-sm font-semibold">Assessors</h2><Link className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-200 transition hover:text-white" href="/assessor">Explore assessor workspace <ArrowUpRight size={15} /></Link></div>
          </div>
          <div className="flex flex-col gap-2 border-t border-white/10 py-3 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 ProofWork. Skills deserve proof.</span><span>Real work. Clear evidence. Human judgment.</span></div>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Check, CircleDot, FileCheck2, Fingerprint, Layers3, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

const steps = [
  { number: "01", icon: Layers3, title: "Show your work", text: "Submit a real project with the decisions, process, and evidence behind it." },
  { number: "02", icon: Sparkles, title: "Get a fair review", text: "AI helps organize the evidence. Experienced assessors make the judgment." },
  { number: "03", icon: BadgeCheck, title: "Share what you can do", text: "Receive a clear, verified skills report you can take to your next opportunity." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface-50 text-navy-950">
      <SiteHeader />
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: "radial-gradient(ellipse at 75% 25%, rgba(20,184,166,.32), transparent 34%), radial-gradient(ellipse at 4% 90%, rgba(65,110,192,.24), transparent 36%)" }} />
        <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-10 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent-300/20 bg-accent-300/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-accent-200"><span className="size-1.5 rounded-full bg-accent-400" /> A better way to prove your skills</div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.04] tracking-[-.055em] sm:text-6xl lg:text-[4.4rem]">Your work speaks.<br /><span className="text-accent-300">Now make it count.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/65">Turn real projects into trusted proof of what you can do. Get thoughtful human assessment, backed by AI and grounded in your actual work.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-accent-400 px-6 font-semibold text-navy-950 hover:bg-accent-300"><Link href="/register">Start your portfolio <ArrowRight className="ml-2 size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"><a href="#how-it-works">See how it works <ArrowDown className="ml-2 size-4" /></a></Button>
            </div>
            <div className="mt-9 flex items-center gap-3 text-sm text-white/55"><span className="flex -space-x-2"><span className="grid size-8 place-items-center rounded-full border-2 border-navy-950 bg-accent-200 text-[10px] font-bold text-navy-900">LW</span><span className="grid size-8 place-items-center rounded-full border-2 border-navy-950 bg-blue-200 text-[10px] font-bold text-navy-900">AM</span><span className="grid size-8 place-items-center rounded-full border-2 border-navy-950 bg-orange-200 text-[10px] font-bold text-navy-900">TK</span></span><span>Built for people who learn by doing.</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[510px] lg:ml-auto">
            <div className="absolute -inset-8 rounded-[2.5rem] bg-accent-400/10 blur-3xl" />
            <div className="relative rounded-[1.5rem] border border-white/10 bg-white p-5 text-navy-950 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[.16em] text-surface-500">Verified skill report</div><h2 className="mt-2 text-xl font-semibold tracking-tight">Frontend development</h2></div><span className="grid size-11 place-items-center rounded-full bg-accent-50 text-accent-700"><ShieldCheck size={22} /></span></div>
              <div className="mt-6 rounded-xl border border-surface-200 bg-surface-50 p-4"><div className="flex items-center justify-between"><div className="text-sm font-medium">Portfolio project</div><span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-semibold text-accent-800"><Check size={12} /> Verified</span></div><div className="mt-1 text-sm text-surface-500">Commerce dashboard · v2.1</div><div className="mt-4 flex gap-1"><span className="h-1.5 flex-1 rounded-full bg-accent-500"/><span className="h-1.5 flex-1 rounded-full bg-accent-500"/><span className="h-1.5 flex-1 rounded-full bg-accent-500"/><span className="h-1.5 flex-1 rounded-full bg-accent-500"/><span className="h-1.5 flex-1 rounded-full bg-surface-200"/></div></div>
              <div className="mt-5 space-y-4">{[{ label: "Component architecture", value: "Strong", width: "88%" }, { label: "Accessibility", value: "Proficient", width: "74%" }, { label: "Responsive design", value: "Strong", width: "84%" }].map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-xs"><span className="font-medium text-navy-800">{item.label}</span><span className="text-surface-500">{item.value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-surface-100"><div className="h-full rounded-full bg-accent-500" style={{ width: item.width }} /></div></div>)}</div>
              <div className="mt-6 flex items-center justify-between border-t border-surface-200 pt-5"><div className="flex items-center gap-2 text-xs text-surface-500"><Users size={15} /> Reviewed by 2 assessors</div><span className="flex items-center gap-1 text-xs font-medium text-navy-700"><Fingerprint size={14} /> PW-8F2A91</span></div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-elevated sm:flex"><span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-700"><FileCheck2 size={18} /></span><span><span className="block text-xs font-semibold">Evidence first</span><span className="block text-[11px] text-surface-500">Every rating links to your work</span></span></div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl border-t border-white/10 px-5 sm:px-8"><div className="grid gap-5 py-6 text-sm text-white/55 sm:grid-cols-3 sm:gap-8"><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-accent-300" /> Human-verified assessments</div><div className="flex items-center gap-2"><CircleDot className="size-4 text-accent-300" /> Evidence-based feedback</div><div className="flex items-center gap-2"><Star className="size-4 text-accent-300" /> Reports you can share</div></div></div>
      </section>
      <section id="how-it-works" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl"><div className="max-w-2xl"><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-700">From project to proof</div><h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-.04em] sm:text-4xl">A clear path from doing the work to showing what it means.</h2><p className="mt-4 text-base leading-7 text-surface-600">Your portfolio shows what you made. ProofWork helps people understand the skills behind it.</p></div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">{steps.map(({ number, icon: Icon, title, text }) => <article key={number} className="rounded-2xl border border-surface-200 bg-white p-7 shadow-subtle"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-xl bg-accent-50 text-accent-700"><Icon size={22} /></span><span className="font-mono text-sm text-surface-400">{number}</span></div><h3 className="mt-7 text-lg font-semibold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-surface-600">{text}</p></article>)}</div>
        </div>
      </section>
      <section id="for-assessors" className="scroll-mt-20 border-y border-surface-200 bg-white px-5 py-20 sm:px-8 sm:py-24"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-center"><div className="max-w-2xl"><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-700">For assessors</div><h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Help make practical skills visible.</h2><p className="mt-4 text-base leading-7 text-surface-600">Bring your experience to thoughtful, consistent reviews. Our rubric-led workflow keeps the focus on evidence, useful feedback, and human judgment.</p></div><Button asChild size="lg" variant="outline" className="h-12 justify-self-start border-navy-200 px-6 text-navy-900 hover:bg-navy-50 lg:justify-self-end"><Link href="/assessor">Explore assessor workspace <ArrowUpRight className="ml-2 size-4" /></Link></Button></div></section>
      <section className="bg-navy-950 px-5 py-20 text-white sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-300">Make your next move</div><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Let the work speak for itself.</h2></div><Button asChild size="lg" className="h-12 bg-accent-400 px-6 font-semibold text-navy-950 hover:bg-accent-300"><Link href="/register">Create your portfolio <ArrowRight className="ml-2 size-4" /></Link></Button></div></section>
      <footer className="bg-navy-950 px-5 pb-8 text-white sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 ProofWork. Skills deserve proof.</span><div className="flex gap-5"><Link className="hover:text-white" href="/login">Log in</Link><Link className="hover:text-white" href="/register">Get verified</Link></div></div></footer>
    </main>
  );
}

'use client';

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { requestWorkspaceAccess } from "@/features/users/access-actions";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

const copy: Record<AuthMode, { eyebrow: string; title: string; description: string; submit: string }> = {
  login: { eyebrow: "Welcome back", title: "Your work is waiting", description: "Sign in to pick up where you left off and keep building proof of what you can do.", submit: "Continue to my workspace" },
  register: { eyebrow: "Start with your work", title: "Give your work a place to grow", description: "Start with one real project. You do not need a perfect portfolio to begin.", submit: "Create my account" },
  "forgot-password": { eyebrow: "Account recovery", title: "Let’s get you back in", description: "Enter your account email and we’ll send recovery instructions if it matches a ProofWork account.", submit: "Send recovery link" },
  "reset-password": { eyebrow: "Choose a new password", title: "Set a new password", description: "Choose a strong password you do not use on another site, then return to your work.", submit: "Save new password" },
};

function getWorkspacePath(role?: string) {
  if (role === "admin") return "/admin";
  if (role === "assessor" || role === "moderator") return "/assessor";
  return "/dashboard";
}

export function AuthPanel({
  mode,
  token,
  emailConfigured = true,
}: {
  mode: AuthMode;
  token?: string;
  emailConfigured?: boolean;
}) {
  const router = useRouter();
  const content = copy[mode];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requestedRole, setRequestedRole] = useState<"learner" | "employer" | "assessor">("learner");
  const tokenIsMissing = mode === "reset-password" && !token;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    try {
      if (mode === "login") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message);
        const signedInUser = result.data?.user as { role?: string } | undefined;
        router.replace(getWorkspacePath(signedInUser?.role));
        router.refresh();
      } else if (mode === "register") {
        const result = await authClient.signUp.email({ email, password, name });
        if (result.error) throw new Error(result.error.message);
        if (requestedRole !== "learner") {
          const accessRequest = new FormData();
          accessRequest.set("requestedRole", requestedRole);
          accessRequest.set("organization", String(form.get("organization") ?? ""));
          accessRequest.set("reason", String(form.get("accessReason") ?? ""));
          try {
            await requestWorkspaceAccess(accessRequest);
            router.replace("/dashboard?accessRequestSubmitted=1");
          } catch {
            router.replace("/dashboard?accessRequestFailed=1");
          }
        } else {
          router.replace("/dashboard");
        }
        router.refresh();
      } else if (mode === "forgot-password") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) throw new Error("We couldn’t start password recovery. Please try again shortly.");
        setMessage("If an account matches that email, recovery instructions are on the way.");
      } else if (mode === "reset-password") {
        const confirmPassword = String(form.get("confirmPassword") ?? "");
        if (password !== confirmPassword) throw new Error("Those passwords don’t match.");
        if (!token) throw new Error("This reset link is missing or invalid. Request a new one to continue.");
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) throw new Error("This reset link is invalid or expired. Request a new link to continue.");
        setMessage("Your password has been updated. You can now sign in with it.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const isPasswordMode = mode === "login" || mode === "register" || mode === "reset-password";
  const submitDisabled = busy || tokenIsMissing || (mode === "forgot-password" && !emailConfigured);

  return (
    <main className="grid min-h-screen bg-surface-50 lg:grid-cols-[.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"><div aria-hidden="true" className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(ellipse at 20% 70%, rgba(20,184,166,.3), transparent 45%)" }} /><Link href="/" className="relative flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-accent-400 text-navy-950"><ShieldCheck size={20} /></span><span className="text-lg font-semibold">proofwork<span className="text-accent-400">.</span></span></Link><div className="relative max-w-lg pb-10"><div className="text-xs font-semibold uppercase tracking-[.18em] text-accent-300">Proof beats promises</div><h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-.04em]">Make the work you do open doors for what comes next.</h2><p className="mt-5 text-base leading-7 text-white/60">A considered review of real projects. Clear feedback. Skills you can stand behind.</p><div className="mt-10 flex items-center gap-3 text-sm text-white/60"><span className="grid size-9 place-items-center rounded-full bg-white/10"><ShieldCheck size={17} className="text-accent-300" /></span>Independent human review, grounded in evidence</div></div><div className="relative text-xs text-white/40">© 2026 ProofWork</div></aside>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10"><div className="w-full max-w-md"><Link href="/" className="inline-flex items-center gap-2 text-sm text-surface-500 transition hover:text-navy-900"><ArrowLeft size={15} /> Back to home</Link><div className="mb-8 mt-12 lg:hidden"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-navy-950 text-accent-300"><ShieldCheck size={20} /></span><span className="text-lg font-semibold tracking-tight">proofwork<span className="text-accent-600">.</span></span></div></div><div className="text-xs font-semibold uppercase tracking-[.16em] text-accent-700">{content.eyebrow}</div><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-navy-950">{content.title}</h1><p className="mt-3 text-sm leading-6 text-surface-600">{content.description}</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {mode !== "reset-password" && <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>}
          {mode === "register" && <div className="space-y-2"><Label htmlFor="name">Your name</Label><Input id="name" name="name" autoComplete="name" placeholder="How should we address you?" required /></div>}
          {mode === "register" && <div className="space-y-2"><Label htmlFor="workspaceRole">What brings you to ProofWork?</Label><select id="workspaceRole" name="workspaceRole" value={requestedRole} onChange={(event) => setRequestedRole(event.target.value as typeof requestedRole)} className="min-h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm"><option value="learner">I’m building my skills portfolio</option><option value="employer">I’m hiring or evaluating talent</option><option value="assessor">I want to review learner work</option></select><p className="text-xs leading-5 text-surface-500">Employer and assessor workspaces need approval. Every new account starts as a learner, so choosing one here never grants elevated access by itself.</p></div>}
          {mode === "register" && requestedRole !== "learner" && <><div className="space-y-2"><Label htmlFor="organization">Organization</Label><Input id="organization" name="organization" maxLength={160} placeholder="Company, school, or independent practice" /></div><div className="space-y-2"><Label htmlFor="accessReason">Why do you need this workspace?</Label><textarea id="accessReason" name="accessReason" minLength={20} maxLength={2000} required className="min-h-24 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm" placeholder="Tell us how you plan to use ProofWork (at least 20 characters)." /></div></>}
          {isPasswordMode && <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password">{mode === "reset-password" ? "New password" : "Password"}</Label>{mode === "login" && <Link href="/forgot-password" className="text-xs font-medium text-accent-700 hover:text-accent-800">Forgot password?</Link>}</div><Input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} maxLength={128} placeholder="At least 8 characters" required /></div>}
          {mode === "reset-password" && <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm new password</Label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} placeholder="Enter the new password again" required /></div>}
          {mode === "forgot-password" && !emailConfigured && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Password recovery email is not configured yet. Ask your administrator to finish email setup.</p>}
          {tokenIsMissing && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">This reset link is missing its token. <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>.</p>}
          {message && <p role="status" className="rounded-lg border border-accent-200 bg-accent-50 p-3 text-sm leading-5 text-accent-900">{message}</p>}
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800">{error}</p>}
          {!(mode === "reset-password" && message) && <Button type="submit" disabled={submitDisabled} className="h-11 w-full bg-navy-900 font-semibold text-white hover:bg-navy-800">{busy ? "Please wait…" : content.submit}</Button>}
        </form>
        {mode === "reset-password" && message ? <div className="mt-7 text-center text-sm"><Link href="/login" className="font-semibold text-accent-700 hover:text-accent-800">Continue to sign in</Link></div> : <div className="mt-7 border-t border-surface-200 pt-6 text-center text-sm text-surface-600">{mode === "login" ? <>New to ProofWork? <Link href="/register" className="font-semibold text-accent-700 hover:text-accent-800">Create an account</Link></> : mode === "register" ? <>Already have an account? <Link href="/login" className="font-semibold text-accent-700 hover:text-accent-800">Sign in</Link></> : <>Remembered it? <Link href="/login" className="font-semibold text-accent-700 hover:text-accent-800">Back to sign in</Link></>}</div>}
      </div></section>
    </main>
  );
}

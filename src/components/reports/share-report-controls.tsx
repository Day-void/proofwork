"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createReportShare, revokeReportShare } from "@/features/assessment/moderation-actions";

type Share = { id: string; createdAt: Date; revokedAt: Date | null };

export function ShareReportControls({ requestId, shares }: { requestId: string; shares: Share[] }) {
  const [state, action, pending] = useActionState(createReportShare, {});
  return <div className="mt-5 rounded-lg border border-surface-200 bg-surface-50 p-4">
    <h2 className="text-sm font-semibold">Share this report</h2>
    <p className="mt-1 text-xs leading-5 text-surface-600">Create a private link for a specific employer or reviewer. Anyone with an active link can view the verification summary. Revoke links at any time.</p>
    <form action={action} className="mt-3"><input type="hidden" name="requestId" value={requestId} /><Button type="submit" size="sm" disabled={pending} className="bg-navy-900 text-white hover:bg-navy-800">{pending ? "Creating link…" : "Create share link"}</Button></form>
    {state.error && <p role="alert" className="mt-2 text-xs text-red-700">{state.error}</p>}
    {state.url && <p role="status" className="mt-3 break-all rounded-md bg-white p-3 text-xs"><strong>Copy this link now:</strong><br /><a href={state.url} className="text-accent-800 underline">{state.url}</a></p>}
    {shares.length > 0 && <ul className="mt-3 space-y-2">{shares.map((share) => <li key={share.id} className="flex items-center justify-between gap-3 rounded-md bg-white p-3 text-xs"><span>{share.revokedAt ? "Revoked" : "Active link"} · created {share.createdAt.toLocaleDateString()}</span>{!share.revokedAt && <form action={revokeReportShare}><input type="hidden" name="shareId" value={share.id} /><Button type="submit" size="sm" variant="outline">Revoke</Button></form>}</li>)}</ul>}
  </div>;
}

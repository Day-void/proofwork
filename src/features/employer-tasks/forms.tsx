"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  createEmployerTask,
  respondToEmployerTask,
  reviewEmployerTask,
  submitEmployerTask,
} from "@/features/employer-tasks/actions";
import type { EmployerTaskActionState } from "@/features/employer-tasks/actions";

const initialState: EmployerTaskActionState = {};

function Feedback({ state }: { state: EmployerTaskActionState }) {
  if (state.error) return <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{state.error}</p>;
  if (state.success) return <p role="status" className="mt-3 rounded-lg border border-accent-200 bg-accent-50 p-3 text-sm text-accent-900">{state.success}</p>;
  return null;
}

type DiscoverableLearner = { id: string; name: string; roleTitle: string };

export function EmployerTaskInviteForm({ learners }: { learners: DiscoverableLearner[] }) {
  const [state, action, pending] = useActionState(createEmployerTask, initialState);
  return <form action={action} className="mt-4 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-medium">Learner<select required name="learnerId" className="mt-1.5 min-h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm">{learners.map((learner) => <option key={learner.id} value={learner.id}>{learner.name} · {learner.roleTitle}</option>)}</select></label>
    <label className="text-sm font-medium">Task title<input required minLength={4} maxLength={120} name="title" placeholder="Example: Review an onboarding flow" className="mt-1.5 min-h-10 w-full rounded-lg border border-surface-200 px-3 text-sm" /></label>
    <label className="text-sm font-medium">Skill area<input required minLength={2} maxLength={100} name="skillArea" placeholder="Frontend development" className="mt-1.5 min-h-10 w-full rounded-lg border border-surface-200 px-3 text-sm" /></label>
    <label className="text-sm font-medium">Due date (optional)<input type="date" name="dueAt" className="mt-1.5 min-h-10 w-full rounded-lg border border-surface-200 px-3 text-sm" /></label>
    <label className="text-sm font-medium md:col-span-2">Instructions<textarea required minLength={30} maxLength={5000} name="instructions" placeholder="Describe the task, context, and what a useful response should include." className="mt-1.5 min-h-28 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></label>
    <label className="text-sm font-medium md:col-span-2">What you will look for<textarea required minLength={10} maxLength={2000} name="criteria" placeholder="List the skills or criteria you will use to review the response." className="mt-1.5 min-h-20 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" /></label>
    <div className="md:col-span-2"><Button type="submit" disabled={pending} className="bg-navy-900 text-white hover:bg-navy-800">{pending ? "Sending invitation…" : "Send task invitation"}</Button><p className="mt-2 text-xs text-surface-500">Only learners who opted into discovery and have an approved discoverable role are listed. Keep tasks job-related and avoid requesting sensitive personal information.</p><Feedback state={state} /></div>
  </form>;
}

export function LearnerTaskDecisionForms({ taskId }: { taskId: string }) {
  const [acceptState, acceptAction, accepting] = useActionState(respondToEmployerTask, initialState);
  const [declineState, declineAction, declining] = useActionState(respondToEmployerTask, initialState);
  return <div className="mt-5 flex flex-wrap gap-2">
    <form action={acceptAction}><input type="hidden" name="taskId" value={taskId} /><input type="hidden" name="decision" value="accepted" /><Button type="submit" disabled={accepting || declining} className="bg-navy-900 text-white hover:bg-navy-800">{accepting ? "Accepting…" : "Accept task"}</Button><Feedback state={acceptState} /></form>
    <form action={declineAction}><input type="hidden" name="taskId" value={taskId} /><input type="hidden" name="decision" value="declined" /><Button type="submit" disabled={accepting || declining} variant="outline">{declining ? "Declining…" : "Decline"}</Button><Feedback state={declineState} /></form>
  </div>;
}

export function LearnerTaskResponseForm({ taskId }: { taskId: string }) {
  const [state, action, pending] = useActionState(submitEmployerTask, initialState);
  return <form action={action} className="mt-5 space-y-3"><input type="hidden" name="taskId" value={taskId} />
    <label className="block text-sm font-medium">Your response<textarea required minLength={30} maxLength={5000} name="learnerResponse" className="mt-1.5 min-h-32 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="Describe what you did, your decisions, and what you learned." /></label>
    <label className="block text-sm font-medium">Evidence link (optional)<input type="url" name="evidenceUrl" maxLength={2000} placeholder="https://…" className="mt-1.5 min-h-10 w-full rounded-lg border border-surface-200 px-3 text-sm" /><span className="mt-1 block text-xs font-normal text-surface-500">Share only material you are allowed to share with this employer.</span></label>
    <Button type="submit" disabled={pending} className="bg-navy-900 text-white hover:bg-navy-800">{pending ? "Submitting response…" : "Submit task response"}</Button><Feedback state={state} />
  </form>;
}

export function EmployerTaskFeedbackForm({ taskId }: { taskId: string }) {
  const [state, action, pending] = useActionState(reviewEmployerTask, initialState);
  return <form action={action} className="mt-4"><input type="hidden" name="taskId" value={taskId} />
    <label className="text-sm font-medium">Feedback for the learner<textarea required minLength={10} maxLength={3000} name="employerFeedback" className="mt-1.5 min-h-24 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm" placeholder="Share specific, useful feedback about their approach." /></label>
    <Button type="submit" disabled={pending} className="mt-3 bg-navy-900 text-white hover:bg-navy-800">{pending ? "Sending feedback…" : "Send feedback"}</Button><Feedback state={state} />
  </form>;
}

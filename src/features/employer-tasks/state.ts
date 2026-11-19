export type EmployerTaskStatus = "invited" | "accepted" | "declined" | "submitted" | "reviewed";
export type EmployerTaskEvent = "accept" | "decline" | "submit" | "review";

const nextState: Record<EmployerTaskStatus, Partial<Record<EmployerTaskEvent, EmployerTaskStatus>>> = {
  invited: { accept: "accepted", decline: "declined" },
  accepted: { submit: "submitted" },
  declined: {},
  submitted: { review: "reviewed" },
  reviewed: {},
};

export function transitionEmployerTask(status: EmployerTaskStatus, event: EmployerTaskEvent): EmployerTaskStatus {
  const next = nextState[status][event];
  if (!next) throw new Error(`Cannot ${event} a task while it is ${status}.`);
  return next;
}

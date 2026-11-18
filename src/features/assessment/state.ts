export const verificationStatuses = ["submitted", "in_review", "moderation", "approved", "needs_more_evidence", "appealed", "rejected", "revoked"] as const;
export type VerificationStatus = (typeof verificationStatuses)[number];

const transitions: Record<VerificationStatus, readonly VerificationStatus[]> = {
  submitted: ["in_review", "appealed"],
  in_review: ["moderation", "approved", "rejected", "needs_more_evidence"],
  moderation: ["approved", "rejected", "needs_more_evidence"],
  approved: ["appealed", "revoked"],
  needs_more_evidence: ["appealed"],
  rejected: ["appealed"],
  appealed: ["submitted", "approved", "rejected", "needs_more_evidence"],
  revoked: [],
};

export function canTransition(from: VerificationStatus, to: VerificationStatus) {
  return transitions[from].includes(to);
}

export function assertTransition(from: VerificationStatus, to: VerificationStatus) {
  if (!canTransition(from, to)) throw new Error(`Invalid verification transition: ${from} → ${to}.`);
}

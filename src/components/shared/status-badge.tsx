import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  assigned: "Assigned",
  in_progress: "In progress",
  in_review: "In review",
  moderation: "Needs moderation",
  approved: "Verified",
  needs_more_evidence: "More evidence needed",
  appealed: "Appealed",
  rejected: "Not approved",
  revoked: "Withdrawn",
  published: "Published",
  retired: "Retired",
  pending: "Needs disclosure",
  cleared: "Cleared",
  recused: "Recused",
  queued: "Queued",
  running: "Processing",
  completed: "Complete",
  failed: "Failed",
  revision_requested: "Revision requested",
};

const tones: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-800",
  published: "bg-emerald-50 text-emerald-800",
  completed: "bg-emerald-50 text-emerald-800",
  cleared: "bg-emerald-50 text-emerald-800",
  moderation: "bg-amber-50 text-amber-900",
  needs_more_evidence: "bg-amber-50 text-amber-900",
  pending: "bg-amber-50 text-amber-900",
  revision_requested: "bg-amber-50 text-amber-900",
  rejected: "bg-red-50 text-red-800",
  revoked: "bg-surface-100 text-surface-700",
  recused: "bg-amber-50 text-amber-900",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  return <Badge variant="secondary" className={tones[normalized] ?? "bg-surface-100 text-surface-700"}>{labels[normalized] ?? status.replaceAll("_", " ")}</Badge>;
}

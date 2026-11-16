import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { assessorReview, learnerProject, projectSubmission, submissionEvidence, user, verificationRequest } from "@/lib/database/schema";
import { createR2PresignedUrl } from "@/lib/storage/r2";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sign-in required." }, { status: 401 });
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const accountRole = session.user.role ?? "learner";
  const [account] = await db.select({ disabled: user.disabled }).from(user).where(eq(user.id, session.user.id)).limit(1);
  if (account?.disabled) return NextResponse.json({ error: "This account is disabled." }, { status: 403 });
  const evidenceId = new URL(request.url).searchParams.get("evidenceId");
  if (!evidenceId) return NextResponse.json({ error: "Evidence not found." }, { status: 404 });
  const [evidence] = await db.select({ evidence: submissionEvidence, project: learnerProject }).from(submissionEvidence)
    .innerJoin(projectSubmission, eq(submissionEvidence.submissionId, projectSubmission.id))
    .innerJoin(learnerProject, eq(projectSubmission.projectId, learnerProject.id))
    .where(and(eq(submissionEvidence.id, evidenceId), eq(submissionEvidence.kind, "file"))).limit(1);
  if (!evidence?.evidence.objectKey) return NextResponse.json({ error: "Evidence not found." }, { status: 404 });
  let authorized = evidence.project.learnerId === session.user.id;
  if (!authorized && accountRole === "assessor") {
    const requests = await db.select({ id: verificationRequest.id }).from(verificationRequest)
      .innerJoin(assessorReview, eq(assessorReview.requestId, verificationRequest.id))
      .where(and(eq(verificationRequest.portfolioSubmissionId, evidence.evidence.submissionId), eq(assessorReview.assessorId, session.user.id), eq(assessorReview.conflictStatus, "cleared"), inArray(assessorReview.status, ["in_progress", "submitted"])));
    authorized = requests.length > 0;
  }
  if (!authorized && !["admin", "moderator"].includes(accountRole)) return NextResponse.json({ error: "Not authorized to access this evidence." }, { status: 403 });
  try {
    return NextResponse.redirect(await createR2PresignedUrl("GET", evidence.evidence.objectKey, 120));
  } catch {
    return NextResponse.json({ error: "File storage is unavailable." }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { getCurrentSession } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { learnerProject, projectSubmission, uploadSession, user } from "@/lib/database/schema";
import { createR2PresignedUrl } from "@/lib/storage/r2";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain"] as const;

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "learner") return NextResponse.json({ error: "Learner sign-in required." }, { status: 401 });
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const [account] = await db.select({ disabled: user.disabled }).from(user).where(eq(user.id, session.user.id)).limit(1);
  if (account?.disabled) return NextResponse.json({ error: "This account is disabled." }, { status: 403 });
  const parsed = z.object({ submissionId: z.string().uuid(), fileName: z.string().min(1).max(200), contentType: z.enum(allowedTypes), byteSize: z.number().int().positive().max(10 * 1024 * 1024) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a PDF, PNG, JPEG, WebP, or text file up to 10 MB." }, { status: 400 });
  const [draft] = await db.select({ id: projectSubmission.id }).from(projectSubmission)
    .innerJoin(learnerProject, eq(projectSubmission.projectId, learnerProject.id))
    .where(and(eq(projectSubmission.id, parsed.data.submissionId), eq(learnerProject.learnerId, session.user.id), eq(projectSubmission.status, "draft"))).limit(1);
  if (!draft) return NextResponse.json({ error: "This submission is unavailable for upload." }, { status: 404 });
  const extension = parsed.data.fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const objectKey = `proofwork/${session.user.id}/${crypto.randomUUID()}.${extension}`;
  try {
    const uploadUrl = await createR2PresignedUrl("PUT", objectKey, 300, { contentType: parsed.data.contentType, contentLength: parsed.data.byteSize });
    const uploadSessionId = crypto.randomUUID();
    await db.insert(uploadSession).values({ id: uploadSessionId, userId: session.user.id, submissionId: parsed.data.submissionId, objectKey, contentType: parsed.data.contentType, byteSize: parsed.data.byteSize, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    return NextResponse.json({ uploadUrl, objectKey, uploadSessionId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storage is unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

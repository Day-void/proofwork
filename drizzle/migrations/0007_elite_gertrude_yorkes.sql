DROP INDEX "ai_analysis_job_request_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "ai_analysis_job_request_unique" ON "ai_analysis_job" USING btree ("request_id");--> statement-breakpoint
ALTER TABLE "challenge_evidence" ADD CONSTRAINT "challenge_evidence_shape_check" CHECK ((
    ("challenge_evidence"."kind" = 'link' AND "challenge_evidence"."url" IS NOT NULL AND "challenge_evidence"."object_key" IS NULL)
    OR
    ("challenge_evidence"."kind" = 'file' AND "challenge_evidence"."object_key" IS NOT NULL AND "challenge_evidence"."content_type" IS NOT NULL AND "challenge_evidence"."byte_size" IS NOT NULL AND "challenge_evidence"."byte_size" > 0)
  ));--> statement-breakpoint
ALTER TABLE "submission_evidence" ADD CONSTRAINT "submission_evidence_shape_check" CHECK ((
    ("submission_evidence"."kind" = 'link' AND "submission_evidence"."url" IS NOT NULL AND "submission_evidence"."object_key" IS NULL)
    OR
    ("submission_evidence"."kind" = 'file' AND "submission_evidence"."object_key" IS NOT NULL AND "submission_evidence"."content_type" IS NOT NULL AND "submission_evidence"."byte_size" IS NOT NULL AND "submission_evidence"."byte_size" > 0)
  ));
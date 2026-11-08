CREATE TABLE "assessment_role" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"target_level" text NOT NULL,
	"description" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessor_review" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"assessor_id" text NOT NULL,
	"status" text DEFAULT 'assigned' NOT NULL,
	"conflict_status" text DEFAULT 'pending' NOT NULL,
	"conflict_reason" text,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "challenge_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"challenge_submission_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"object_key" text,
	"content_type" text,
	"byte_size" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_submission" (
	"id" text PRIMARY KEY NOT NULL,
	"challenge_id" text NOT NULL,
	"learner_id" text NOT NULL,
	"version" integer NOT NULL,
	"response" text DEFAULT '' NOT NULL,
	"source_url" text,
	"demo_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"assistance_disclosure" text DEFAULT '' NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_rating" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"criterion_id" text NOT NULL,
	"rating" text NOT NULL,
	"rationale" text NOT NULL,
	"evidence_reference" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_challenge" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"brief" text NOT NULL,
	"acceptance_criteria" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rubric_criterion" (
	"id" text PRIMARY KEY NOT NULL,
	"rubric_version_id" text NOT NULL,
	"criterion_key" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"evidence_guidance" text NOT NULL,
	"developing_anchor" text NOT NULL,
	"meets_anchor" text NOT NULL,
	"strong_anchor" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubric_version" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "verification_request" (
	"id" text PRIMARY KEY NOT NULL,
	"learner_id" text NOT NULL,
	"role_id" text NOT NULL,
	"rubric_version_id" text NOT NULL,
	"portfolio_submission_id" text NOT NULL,
	"challenge_submission_id" text NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"discoverable" boolean DEFAULT false NOT NULL,
	"verification_token_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "assessor_review" ADD CONSTRAINT "assessor_review_request_id_verification_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."verification_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessor_review" ADD CONSTRAINT "assessor_review_assessor_id_user_id_fk" FOREIGN KEY ("assessor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_evidence" ADD CONSTRAINT "challenge_evidence_challenge_submission_id_challenge_submission_id_fk" FOREIGN KEY ("challenge_submission_id") REFERENCES "public"."challenge_submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_submission" ADD CONSTRAINT "challenge_submission_challenge_id_role_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."role_challenge"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_submission" ADD CONSTRAINT "challenge_submission_learner_id_user_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_rating" ADD CONSTRAINT "competency_rating_review_id_assessor_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."assessor_review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_rating" ADD CONSTRAINT "competency_rating_criterion_id_rubric_criterion_id_fk" FOREIGN KEY ("criterion_id") REFERENCES "public"."rubric_criterion"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_challenge" ADD CONSTRAINT "role_challenge_role_id_assessment_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."assessment_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubric_criterion" ADD CONSTRAINT "rubric_criterion_rubric_version_id_rubric_version_id_fk" FOREIGN KEY ("rubric_version_id") REFERENCES "public"."rubric_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubric_version" ADD CONSTRAINT "rubric_version_role_id_assessment_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."assessment_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_request" ADD CONSTRAINT "verification_request_learner_id_user_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_request" ADD CONSTRAINT "verification_request_role_id_assessment_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."assessment_role"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_request" ADD CONSTRAINT "verification_request_rubric_version_id_rubric_version_id_fk" FOREIGN KEY ("rubric_version_id") REFERENCES "public"."rubric_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_request" ADD CONSTRAINT "verification_request_portfolio_submission_id_project_submission_id_fk" FOREIGN KEY ("portfolio_submission_id") REFERENCES "public"."project_submission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_request" ADD CONSTRAINT "verification_request_challenge_submission_id_challenge_submission_id_fk" FOREIGN KEY ("challenge_submission_id") REFERENCES "public"."challenge_submission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_role_slug_unique" ON "assessment_role" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "assessor_review_request_assessor_unique" ON "assessor_review" USING btree ("request_id","assessor_id");--> statement-breakpoint
CREATE INDEX "assessor_review_assessor_status_idx" ON "assessor_review" USING btree ("assessor_id","status");--> statement-breakpoint
CREATE INDEX "challenge_evidence_submission_idx" ON "challenge_evidence" USING btree ("challenge_submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_submission_version_unique" ON "challenge_submission" USING btree ("challenge_id","learner_id","version");--> statement-breakpoint
CREATE INDEX "challenge_submission_owner_idx" ON "challenge_submission" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "challenge_submission_status_idx" ON "challenge_submission" USING btree ("challenge_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "competency_rating_review_criterion_unique" ON "competency_rating" USING btree ("review_id","criterion_id");--> statement-breakpoint
CREATE INDEX "competency_rating_criterion_idx" ON "competency_rating" USING btree ("criterion_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_challenge_version_unique" ON "role_challenge" USING btree ("role_id","version");--> statement-breakpoint
CREATE INDEX "role_challenge_role_status_idx" ON "role_challenge" USING btree ("role_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "rubric_criterion_key_unique" ON "rubric_criterion" USING btree ("rubric_version_id","criterion_key");--> statement-breakpoint
CREATE INDEX "rubric_criterion_version_idx" ON "rubric_criterion" USING btree ("rubric_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rubric_role_version_unique" ON "rubric_version" USING btree ("role_id","version");--> statement-breakpoint
CREATE INDEX "verification_request_learner_idx" ON "verification_request" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "verification_request_status_idx" ON "verification_request" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_request_token_hash_unique" ON "verification_request" USING btree ("verification_token_hash");
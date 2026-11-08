CREATE TABLE "learner_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"headline" text,
	"bio" text,
	"portfolio_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_project" (
	"id" text PRIMARY KEY NOT NULL,
	"learner_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"skill_area" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_submission" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"version" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"project_description" text DEFAULT '' NOT NULL,
	"process" text DEFAULT '' NOT NULL,
	"outcomes" text DEFAULT '' NOT NULL,
	"consent_recorded" boolean DEFAULT false NOT NULL,
	"integrity_confirmed" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"object_key" text,
	"content_type" text,
	"byte_size" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "learner_profile" ADD CONSTRAINT "learner_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_project" ADD CONSTRAINT "learner_project_learner_id_user_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_submission" ADD CONSTRAINT "project_submission_project_id_learner_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."learner_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_evidence" ADD CONSTRAINT "submission_evidence_submission_id_project_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."project_submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "learner_profile_user_unique" ON "learner_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "learner_project_owner_idx" ON "learner_project" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_submission_version_unique" ON "project_submission" USING btree ("project_id","version");--> statement-breakpoint
CREATE INDEX "project_submission_project_idx" ON "project_submission" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "submission_evidence_submission_idx" ON "submission_evidence" USING btree ("submission_id");
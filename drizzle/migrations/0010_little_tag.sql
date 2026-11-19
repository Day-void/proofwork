CREATE TABLE "employer_task" (
	"id" text PRIMARY KEY NOT NULL,
	"employer_id" text NOT NULL,
	"learner_id" text NOT NULL,
	"title" text NOT NULL,
	"skill_area" text NOT NULL,
	"instructions" text NOT NULL,
	"criteria" text NOT NULL,
	"due_at" timestamp with time zone,
	"status" text DEFAULT 'invited' NOT NULL,
	"learner_response" text,
	"evidence_url" text,
	"employer_feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_access_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"requested_role" text NOT NULL,
	"organization" text,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employer_task" ADD CONSTRAINT "employer_task_employer_id_user_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_task" ADD CONSTRAINT "employer_task_learner_id_user_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_access_request" ADD CONSTRAINT "workspace_access_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_access_request" ADD CONSTRAINT "workspace_access_request_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employer_task_employer_status_idx" ON "employer_task" USING btree ("employer_id","status");--> statement-breakpoint
CREATE INDEX "employer_task_learner_status_idx" ON "employer_task" USING btree ("learner_id","status");--> statement-breakpoint
CREATE INDEX "workspace_access_request_status_created_idx" ON "workspace_access_request" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "workspace_access_request_user_idx" ON "workspace_access_request" USING btree ("user_id");
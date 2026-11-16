CREATE TABLE "assessor_calibration" (
	"id" text PRIMARY KEY NOT NULL,
	"assessor_id" text NOT NULL,
	"rubric_version_id" text NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"assessor_note" text,
	"reviewer_note" text,
	"reviewed_by" text,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessor_calibration" ADD CONSTRAINT "assessor_calibration_assessor_id_user_id_fk" FOREIGN KEY ("assessor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessor_calibration" ADD CONSTRAINT "assessor_calibration_rubric_version_id_rubric_version_id_fk" FOREIGN KEY ("rubric_version_id") REFERENCES "public"."rubric_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessor_calibration" ADD CONSTRAINT "assessor_calibration_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessor_calibration_assessor_rubric_unique" ON "assessor_calibration" USING btree ("assessor_id","rubric_version_id");--> statement-breakpoint
CREATE INDEX "assessor_calibration_rubric_status_idx" ON "assessor_calibration" USING btree ("rubric_version_id","status");
CREATE TABLE "upload_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"submission_id" text NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "upload_session_object_key_unique" UNIQUE("object_key")
);
--> statement-breakpoint
ALTER TABLE "upload_session" ADD CONSTRAINT "upload_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_session" ADD CONSTRAINT "upload_session_submission_id_project_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."project_submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "upload_session_user_idx" ON "upload_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upload_session_expiry_idx" ON "upload_session" USING btree ("expires_at");
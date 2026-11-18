import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoles = ["learner", "assessor", "moderator", "admin", "employer"] as const;
export type UserRole = (typeof userRoles)[number];

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").$type<UserRole>().notNull().default("learner"),
  disabled: boolean("disabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("user_email_unique").on(table.email)]);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [
  uniqueIndex("session_token_unique").on(table.token),
  index("session_user_id_idx").on(table.userId),
]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("account_user_id_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const authSchema = { user, session, account, verification };

export const learnerProfile = pgTable("learner_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  headline: text("headline"),
  bio: text("bio"),
  portfolioUrl: text("portfolio_url"),
  discoverable: boolean("discoverable").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("learner_profile_user_unique").on(table.userId)]);

export const learnerProject = pgTable("learner_project", {
  id: text("id").primaryKey(),
  learnerId: text("learner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  skillArea: text("skill_area").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("learner_project_owner_idx").on(table.learnerId)]);

export const projectSubmission = pgTable("project_submission", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => learnerProject.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  status: text("status").$type<"draft" | "submitted">().notNull().default("draft"),
  projectDescription: text("project_description").notNull().default(""),
  process: text("process").notNull().default(""),
  outcomes: text("outcomes").notNull().default(""),
  consentRecorded: boolean("consent_recorded").notNull().default(false),
  integrityConfirmed: boolean("integrity_confirmed").notNull().default(false),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("project_submission_version_unique").on(table.projectId, table.version),
  index("project_submission_project_idx").on(table.projectId),
]);

export const submissionEvidence = pgTable("submission_evidence", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => projectSubmission.id, { onDelete: "cascade" }),
  kind: text("kind").$type<"link" | "file">().notNull(),
  title: text("title").notNull(),
  url: text("url"),
  objectKey: text("object_key"),
  contentType: text("content_type"),
  byteSize: integer("byte_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("submission_evidence_submission_idx").on(table.submissionId),
  check("submission_evidence_shape_check", sql`(
    (${table.kind} = 'link' AND ${table.url} IS NOT NULL AND ${table.objectKey} IS NULL)
    OR
    (${table.kind} = 'file' AND ${table.objectKey} IS NOT NULL AND ${table.contentType} IS NOT NULL AND ${table.byteSize} IS NOT NULL AND ${table.byteSize} > 0)
  )`),
]);

export const assessmentRole = pgTable("assessment_role", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  targetLevel: text("target_level").notNull(),
  description: text("description").notNull(),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("assessment_role_slug_unique").on(table.slug)]);

export const rubricVersion = pgTable("rubric_version", {
  id: text("id").primaryKey(),
  roleId: text("role_id").notNull().references(() => assessmentRole.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  title: text("title").notNull(),
  status: text("status").$type<"draft" | "published" | "retired">().notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
}, (table) => [uniqueIndex("rubric_role_version_unique").on(table.roleId, table.version)]);

export const rubricCriterion = pgTable("rubric_criterion", {
  id: text("id").primaryKey(),
  rubricVersionId: text("rubric_version_id").notNull().references(() => rubricVersion.id, { onDelete: "cascade" }),
  criterionKey: text("criterion_key").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  evidenceGuidance: text("evidence_guidance").notNull(),
  developingAnchor: text("developing_anchor").notNull(),
  meetsAnchor: text("meets_anchor").notNull(),
  strongAnchor: text("strong_anchor").notNull(),
  sortOrder: integer("sort_order").notNull(),
}, (table) => [
  uniqueIndex("rubric_criterion_key_unique").on(table.rubricVersionId, table.criterionKey),
  index("rubric_criterion_version_idx").on(table.rubricVersionId),
]);

export const roleChallenge = pgTable("role_challenge", {
  id: text("id").primaryKey(),
  roleId: text("role_id").notNull().references(() => assessmentRole.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  title: text("title").notNull(),
  brief: text("brief").notNull(),
  acceptanceCriteria: text("acceptance_criteria").notNull(),
  status: text("status").$type<"draft" | "published" | "retired">().notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("role_challenge_version_unique").on(table.roleId, table.version),
  index("role_challenge_role_status_idx").on(table.roleId, table.status),
]);

export const challengeSubmission = pgTable("challenge_submission", {
  id: text("id").primaryKey(),
  challengeId: text("challenge_id").notNull().references(() => roleChallenge.id, { onDelete: "restrict" }),
  learnerId: text("learner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  response: text("response").notNull().default(""),
  sourceUrl: text("source_url"),
  demoUrl: text("demo_url"),
  status: text("status").$type<"draft" | "submitted">().notNull().default("draft"),
  assistanceDisclosure: text("assistance_disclosure").notNull().default(""),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("challenge_submission_version_unique").on(table.challengeId, table.learnerId, table.version),
  index("challenge_submission_owner_idx").on(table.learnerId),
  index("challenge_submission_status_idx").on(table.challengeId, table.status),
]);

export const challengeEvidence = pgTable("challenge_evidence", {
  id: text("id").primaryKey(),
  challengeSubmissionId: text("challenge_submission_id").notNull().references(() => challengeSubmission.id, { onDelete: "cascade" }),
  kind: text("kind").$type<"link" | "file">().notNull(),
  title: text("title").notNull(),
  url: text("url"),
  objectKey: text("object_key"),
  contentType: text("content_type"),
  byteSize: integer("byte_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("challenge_evidence_submission_idx").on(table.challengeSubmissionId),
  check("challenge_evidence_shape_check", sql`(
    (${table.kind} = 'link' AND ${table.url} IS NOT NULL AND ${table.objectKey} IS NULL)
    OR
    (${table.kind} = 'file' AND ${table.objectKey} IS NOT NULL AND ${table.contentType} IS NOT NULL AND ${table.byteSize} IS NOT NULL AND ${table.byteSize} > 0)
  )`),
]);

export const verificationRequest = pgTable("verification_request", {
  id: text("id").primaryKey(),
  learnerId: text("learner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  roleId: text("role_id").notNull().references(() => assessmentRole.id, { onDelete: "restrict" }),
  rubricVersionId: text("rubric_version_id").notNull().references(() => rubricVersion.id, { onDelete: "restrict" }),
  portfolioSubmissionId: text("portfolio_submission_id").notNull().references(() => projectSubmission.id, { onDelete: "restrict" }),
  challengeSubmissionId: text("challenge_submission_id").notNull().references(() => challengeSubmission.id, { onDelete: "restrict" }),
  status: text("status").$type<"submitted" | "in_review" | "moderation" | "approved" | "needs_more_evidence" | "appealed" | "rejected" | "revoked">().notNull().default("submitted"),
  discoverable: boolean("discoverable").notNull().default(false),
  aiAnalysisConsent: boolean("ai_analysis_consent").notNull().default(false),
  verificationTokenHash: text("verification_token_hash"),
  decisionNote: text("decision_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  index("verification_request_learner_idx").on(table.learnerId),
  index("verification_request_status_idx").on(table.status),
  uniqueIndex("verification_request_token_hash_unique").on(table.verificationTokenHash),
  uniqueIndex("verification_request_submission_pair_unique").on(table.learnerId, table.portfolioSubmissionId, table.challengeSubmissionId),
]);

export const assessorReview = pgTable("assessor_review", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => verificationRequest.id, { onDelete: "cascade" }),
  assessorId: text("assessor_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  status: text("status").$type<"assigned" | "in_progress" | "submitted" | "recused">().notNull().default("assigned"),
  conflictStatus: text("conflict_status").$type<"pending" | "cleared" | "recused">().notNull().default("pending"),
  conflictReason: text("conflict_reason"),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("assessor_review_request_assessor_unique").on(table.requestId, table.assessorId),
  index("assessor_review_assessor_status_idx").on(table.assessorId, table.status),
]);

export type CalibrationAnswer = {
  criterionId: string;
  rating: "developing" | "meets_expectations" | "strong";
  rationale: string;
};

export const assessorCalibration = pgTable("assessor_calibration", {
  id: text("id").primaryKey(),
  assessorId: text("assessor_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  rubricVersionId: text("rubric_version_id").notNull().references(() => rubricVersion.id, { onDelete: "restrict" }),
  answers: jsonb("answers").$type<CalibrationAnswer[]>().notNull().default([]),
  status: text("status").$type<"draft" | "submitted" | "approved" | "revision_requested">().notNull().default("draft"),
  assessorNote: text("assessor_note"),
  reviewerNote: text("reviewer_note"),
  reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("assessor_calibration_assessor_rubric_unique").on(table.assessorId, table.rubricVersionId),
  index("assessor_calibration_rubric_status_idx").on(table.rubricVersionId, table.status),
]);

export const verificationShare = pgTable("verification_share", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => verificationRequest.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("verification_share_token_hash_unique").on(table.tokenHash),
  index("verification_share_request_idx").on(table.requestId),
]);

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  details: jsonb("details").$type<Record<string, string | number | boolean | null>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("audit_log_created_idx").on(table.createdAt), index("audit_log_target_idx").on(table.targetType, table.targetId)]);

export const platformSetting = pgTable("platform_setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiAnalysisJob = pgTable("ai_analysis_job", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => verificationRequest.id, { onDelete: "cascade" }),
  status: text("status").$type<"queued" | "running" | "completed" | "failed">().notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  result: jsonb("result").$type<Record<string, unknown>>(),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("ai_analysis_job_status_created_idx").on(table.status, table.createdAt), uniqueIndex("ai_analysis_job_request_unique").on(table.requestId)]);

export const competencyRating = pgTable("competency_rating", {
  id: text("id").primaryKey(),
  reviewId: text("review_id").notNull().references(() => assessorReview.id, { onDelete: "cascade" }),
  criterionId: text("criterion_id").notNull().references(() => rubricCriterion.id, { onDelete: "restrict" }),
  rating: text("rating").$type<"not_yet_demonstrated" | "developing" | "meets_expectations" | "strong" | "insufficient_evidence">().notNull(),
  rationale: text("rationale").notNull(),
  evidenceReference: text("evidence_reference").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("competency_rating_review_criterion_unique").on(table.reviewId, table.criterionId),
  index("competency_rating_criterion_idx").on(table.criterionId),
]);

export const databaseSchema = {
  ...authSchema,
  learnerProfile,
  learnerProject,
  projectSubmission,
  submissionEvidence,
  assessmentRole,
  rubricVersion,
  rubricCriterion,
  roleChallenge,
  challengeSubmission,
  challengeEvidence,
  verificationRequest,
  assessorReview,
  assessorCalibration,
  competencyRating,
  verificationShare,
  auditLog,
  platformSetting,
  aiAnalysisJob,
};

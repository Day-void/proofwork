import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoles = ["learner", "assessor", "moderator", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").$type<UserRole>().notNull().default("learner"),
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
}, (table) => [index("submission_evidence_submission_idx").on(table.submissionId)]);

export const databaseSchema = { ...authSchema, learnerProfile, learnerProject, projectSubmission, submissionEvidence };

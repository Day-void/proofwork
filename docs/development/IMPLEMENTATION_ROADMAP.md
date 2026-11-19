# Implementation Roadmap

*Last updated: 2026-11-19 (access requests and employer-authored task workflow added; Neon migration and service setup remain)*

## Phase 0 — Foundation & Final Foundation Audit ✅

- [x] Initialise Next.js 16 project with TypeScript (strict mode, bundler resolution)
- [x] Migrate to Tailwind CSS v4 with CSS-first architecture (`@import "tailwindcss"`, `@theme inline`)
- [x] Set up App Router with layout, pages, error boundaries, loading states
- [x] Initialise shadcn/ui with `components.json` and install core UI components (Button, Card, Input, Label, Badge, Separator)
- [x] Create Zod v4-validated environment configuration (`src/config/env.ts`)
- [x] Establish modular domain directory structure (`src/features`, `src/components`, `src/lib`, `src/server`)
- [x] Configure Git, `.gitignore`, and preserve initial repository commit
- [x] Migrate to ESLint 9 flat configuration (`eslint.config.mjs`) compatible with Next 16
- [x] Resolve all Critical and High security vulnerabilities (Next.js 16.4.5, PostCSS 8.5.32, Zod 4.6.7)
- [x] Verify Better Auth 1.7.16 and Drizzle ORM 0.45.4 compatibility
- [x] Verify typecheck passes (`tsc --noEmit`, exit code 0)
- [x] Verify linting passes (`npm run lint`, exit code 0)
- [x] Verify production build succeeds (`npm run build`, exit code 0)
- [x] Verify development server starts and renders homepage with Status 200
- [x] Update documentation (FEATURE_STATUS.md, IMPLEMENTATION_ROADMAP.md, ARCHITECTURE_DECISIONS.md)

## Phase 1 — UI Foundation (implementation complete; manual reviews remain)

- [x] Complete design system foundations (typography, colors, elevation, focus rings)
- [x] Build public landing page (hero, value proposition, evidence mechanism, assessor explanation, CTA)
- [x] Build responsive navigation component (header, mobile disclosure menu, workspace menu)
- [x] Create authentication page layouts (login, register, forgot-password)
- [x] Create learner dashboard shell (project overview, reports, empty states)
- [x] Create assessor dashboard shell (review queue overview)
- [x] Create admin dashboard shell (platform overview, users and health navigation)
- [x] Add keyboard focus and screen-reader semantics to primary journeys
- [ ] Manually review keyboard flow, focus placement, and screen-reader output
- [x] Use Lucide iconography and CSS-generated product preview elements
- [x] Verify production build with Webpack (custom temporary output directory; all eight routes prerendered)
- [ ] Visually review responsive layouts across browser sizes

## Phase 2 — Authentication & Database (implementation complete; production mail setup remains)

- [x] Design and implement Drizzle PostgreSQL auth schema
- [x] Generate initial SQL migration
- [x] Apply and verify initial migrations against the configured Neon database
- [x] Configure Better Auth with Neon serverless HTTP driver
- [x] Implement registration flow with email validation (new users are learners)
- [x] Implement login and secure database-backed session handling
- [x] Implement role-based access control (Learner, Assessor, Moderator, Admin)
- [x] Add server-side authorization guards to protected workspaces
- [x] Add protected route boundaries
- [x] Implement password recovery request and reset flows
- [x] Integrate Resend password-reset email delivery
- [ ] Configure production hosting credentials and verified email sender

## Phase 3 — Learner Submissions (implementation complete; R2 provisioning remains)

- [x] Learner profile management (headline, bio, portfolio URL)
- [x] Project creation workflow backed by Neon
- [x] Multi-step submission flow (project setup, then versioned evidence and narrative)
- [x] File upload to Cloudflare R2 (content-type and content-length bound presigned URLs; private signed downloads)
- [x] Submission versioning (submitted snapshots are immutable; revisions start a new version)
- [x] Submission status tracking (draft and submitted)
- [x] Consent and integrity recording at submit time

## Phase 4 — Assessment Engine (in progress)

- [x] Add versioned role, rubric, challenge, verification request, assessor review, and competency rating tables to Neon
- [x] Role catalog and competency definitions (admin-managed role catalog and six entry-level frontend competencies)
- [x] Role-specific rubric design with behavioral rating anchors and versioning (draft editing and publish controls)
- [x] Shared role challenge library (ProofWork-authored and reviewed employer briefs; seeded practice challenge)
- [x] Assessor assignment system (admin assignment requires calibration approval for the request's rubric version)
- [x] Assessor conflict-of-interest disclosure and calibration workflow (disclose or recuse; human approval of rubric-specific calibration)
- [x] Independent assessment interface
- [x] Competency-level evaluation tied to portfolio and challenge evidence
- [x] AI analysis integration (optional Responses API Structured Outputs; explicit learner consent and human decision required)
- [x] Background job processing for AI evaluation (authenticated Vercel Cron worker, retries, and result visibility)
- [x] Assessment save, preview, and submit workflow

## Phase 5 — Moderation & Reports

- [x] Moderation trigger (two-level inter-rater disagreement)
- [x] Moderator review interface
- [x] Final human approval workflow
- [x] Learner appeal and reassessment workflow
- [x] Skill reports with competency ratings, assessor reasoning, evidence references, date, and rubric version
- [x] Unique verification identifiers (unguessable share tokens stored as SHA-256 hashes)
- [x] Public verification endpoint
- [x] Report revocation mechanism

## Phase 6 — Administration & Employer Access

- [x] Admin dashboard with platform statistics
- [x] User management (account listing, role assignment, access disable/enable)
- [x] Employer/assessor workspace access requests with admin approval; public registration still grants learner role only
- [x] Submission and assessment oversight
- [x] Rubric management interface
- [x] Audit log viewer
- [x] Platform settings
- [x] Employer access to learner-opted-in discoverable profiles
- [x] Private report sharing and employer report verification view
- [x] Learner visibility controls and access revocation
- [x] Employer-authored, learner-accepted role tasks with private response and feedback flow

## Phase 7 — Testing & Deployment

- [x] Unit tests for business logic and scoring algorithms (native Node test runner)
- [x] Neon integration contract for the workspace access and employer task schema/lifecycles on disposable branch `proofwork-feature-test`
- [ ] Integration tests for API route handlers
- [ ] End-to-end tests for critical learner and assessor journeys
- [x] Apply and verify migrations on a disposable Neon branch; manual browser journeys still need an account owner
- [x] Resolve TypeScript and lint errors
- [x] Production build
- [x] Vercel deployment configuration (scheduled AI worker; hosting project and environment still need setup)
- [x] Neon database provisioning and connection pooling guide
- [x] Cloudflare R2 bucket security and CORS configuration guide

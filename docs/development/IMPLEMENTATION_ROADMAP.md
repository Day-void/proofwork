# Implementation Roadmap

*Last updated: 2026-11-04*

## Phase 0 — Foundation ✅

- [x] Initialise Next.js 15 project with TypeScript
- [x] Configure Tailwind CSS v3 with design tokens
- [x] Set up App Router with layout, pages, error boundaries
- [x] Create Zod-validated environment configuration
- [x] Establish directory structure
- [x] Configure Git and .gitignore
- [x] Create initial documentation
- [x] Verify build and lint pass
- [x] Create initial Git commit

## Phase 1 — UI Foundation

- [ ] Initialise shadcn/ui components via CLI
- [ ] Define design system (typography, colours, spacing)
- [ ] Build public landing page (hero, features, CTA)
- [ ] Build navigation component
- [ ] Create authentication page layouts (login, register)
- [ ] Create learner dashboard shell
- [ ] Create assessor dashboard shell
- [ ] Create admin dashboard shell
- [ ] Add responsive layouts
- [ ] Source and optimise visual assets

## Phase 2 — Authentication & Database

- [ ] Design and implement Drizzle schema
- [ ] Create initial database migration
- [ ] Configure Better Auth
- [ ] Implement registration flow
- [ ] Implement login flow
- [ ] Implement session management
- [ ] Define user roles (learner, assessor, admin)
- [ ] Implement RBAC middleware
- [ ] Add protected route guards

## Phase 3 — Learner Submissions

- [ ] Learner profile management
- [ ] Project creation workflow
- [ ] Multi-step submission form
- [ ] File upload to R2
- [ ] Submission versioning (immutable snapshots)
- [ ] Submission status tracking
- [ ] Consent recording

## Phase 4 — Assessment Engine

- [ ] Rubric CRUD with versioning
- [ ] Assessor assignment system
- [ ] Independent assessment interface
- [ ] Criterion-level evaluation form
- [ ] AI analysis integration (OpenAI structured outputs)
- [ ] Background job queue for AI processing
- [ ] Assessment save and submit workflow

## Phase 5 — Moderation & Reports

- [ ] Moderation trigger (disagreement threshold)
- [ ] Moderator review interface
- [ ] Final human approval workflow
- [ ] Skill report generation
- [ ] Unique verification identifiers
- [ ] Public verification endpoint
- [ ] Report revocation

## Phase 6 — Administration

- [ ] Admin dashboard with platform statistics
- [ ] User management (CRUD, role assignment)
- [ ] Submission and assessment oversight
- [ ] Rubric management interface
- [ ] Audit log viewer
- [ ] Platform settings

## Phase 7 — Testing & Deployment

- [ ] Vitest unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Playwright E2E tests for critical journeys
- [ ] Resolve all TypeScript and lint errors
- [ ] Optimise assets for production
- [ ] Vercel deployment configuration
- [ ] Neon database provisioning guide
- [ ] R2 bucket configuration guide

# Implementation Roadmap

*Last updated: 2026-11-05 (Foundation Audit Completed)*

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

## Phase 1 — UI Foundation

- [ ] Complete design system (typography, colors, elevation, focus rings)
- [ ] Build public landing page (hero, value proposition, evidence mechanism, assessor explanation, CTA)
- [ ] Build responsive navigation component (header, mobile drawer, user menu)
- [ ] Create authentication page layouts (login, register, forgot-password)
- [ ] Create learner dashboard shell (submission lists, portfolio overview, status tracking)
- [ ] Create assessor dashboard shell (assigned queues, assessment workspace shell)
- [ ] Create admin dashboard shell (platform health, user management shell, metrics)
- [ ] Ensure full keyboard accessibility and screen-reader semantics
- [ ] Source and optimize visual assets and iconography

## Phase 2 — Authentication & Database

- [ ] Design and implement Drizzle PostgreSQL schema
- [ ] Create and test initial database migrations
- [ ] Configure Better Auth with Neon serverless driver
- [ ] Implement registration flow with email validation
- [ ] Implement login flow with secure session management
- [ ] Implement role-based access control (Learner, Assessor, Moderator, Admin)
- [ ] Implement server-side authorization guards and Next.js middleware
- [ ] Add protected route boundaries

## Phase 3 — Learner Submissions

- [ ] Learner profile management
- [ ] Project creation workflow
- [ ] Multi-step submission form
- [ ] File upload to Cloudflare R2 (presigned URLs)
- [ ] Submission versioning (immutable snapshots)
- [ ] Submission status tracking
- [ ] Consent and integrity recording

## Phase 4 — Assessment Engine

- [ ] Rubric CRUD with versioning
- [ ] Assessor assignment system
- [ ] Independent assessment interface
- [ ] Criterion-level evaluation form
- [ ] AI analysis integration (OpenAI structured outputs)
- [ ] Background job processing for AI evaluation
- [ ] Assessment save, preview, and submit workflow

## Phase 5 — Moderation & Reports

- [ ] Moderation trigger (disagreement threshold detection)
- [ ] Moderator review interface
- [ ] Final human approval workflow
- [ ] Skill report generation
- [ ] Unique verification identifiers (cryptographic tokens)
- [ ] Public verification endpoint
- [ ] Report revocation mechanism

## Phase 6 — Administration

- [ ] Admin dashboard with platform statistics
- [ ] User management (CRUD, role assignment, status toggling)
- [ ] Submission and assessment oversight
- [ ] Rubric management interface
- [ ] Audit log viewer
- [ ] Platform settings

## Phase 7 — Testing & Deployment

- [ ] Unit tests for business logic and scoring algorithms
- [ ] Integration tests for API route handlers
- [ ] End-to-end tests for critical learner and assessor journeys
- [ ] Resolve all edge-case TypeScript and lint warnings
- [ ] Production build and asset optimization
- [ ] Vercel deployment configuration
- [ ] Neon database provisioning and connection pooling guide
- [ ] Cloudflare R2 bucket security and CORS configuration

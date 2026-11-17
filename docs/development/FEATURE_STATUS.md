# Feature Status

*Last updated: 2026-11-16 (end-to-end assessment and reporting workflows implemented)*

## Legend

| Symbol | Meaning |
|--------|--------|
| ✅ | Completed |
| 🔄 | In progress |
| ⬜ | Not started |
| 🐛 | Known bug |
| 🚫 | Blocked |

## Phase 0 — Foundation

| Feature | Status | Notes |
|---------|--------|-------|
| Project initialisation | ✅ | package.json, tsconfig, configs |
| Dependency installation | ✅ | All deps upgraded to stable: Next 16.4.5, React 19.0.0, Tailwind 4.3.4, Zod 4.6.7 |
| TypeScript configuration | ✅ | Strict mode, path aliases, automatic react-jsx runtime |
| Tailwind CSS setup | ✅ | Migrated to Tailwind CSS v4 (CSS-first, `@import "tailwindcss"`, `@theme inline` design tokens) |
| shadcn/ui initialisation | ✅ | `components.json` configured; Button, Card, Input, Label, Badge, Separator created |
| Next.js App Router setup | ✅ | Layout, page, error, not-found, loading verified |
| Environment validation | ✅ | Zod v4-based schema with prettified error reporting |
| Directory structure | ✅ | All domain directories created |
| Git initialisation | ✅ | .gitignore, initial commit preserved, clean working tree |
| Build verification | ✅ | Executed production build successfully (exit code 0, Turbopack & Webpack) |
| Lint verification | ✅ | ESLint 9 flat config (`eslint.config.mjs`), 0 errors, 0 warnings |
| Typecheck verification | ✅ | `tsc --noEmit` passed with 0 errors |
| Dev server verification | ✅ | `next dev` verified via HTTP GET (Status 200, shadcn components rendered) |
| Security audit | ✅ | High/Critical runtime vulnerabilities resolved (PostCSS upgraded to 8.5.32, Zod to 4.6.7) |
| Documentation | ✅ | Architecture, feature status, roadmap, ADRs updated |

## Phase 1 — UI Foundation

| Feature | Status | Notes |
|---------|--------|-------|
| Design system | ✅ | Core tokens, type scale, elevation, and global focus-visible treatment |
| Public landing page | ✅ | Responsive hero, evidence report preview, process, assessor value proposition, and CTAs |
| Navigation | ✅ | Responsive public navigation with mobile disclosure menu and workspace menu |
| Authentication pages | ✅ | Login, learner registration, password-reset request, and reset forms are connected to Better Auth |
| Learner dashboard shell | ✅ | Workspace overview, project and report sections, empty states |
| Assessor dashboard shell | ✅ | Review queue, assessment workspace outline, and guidance sections |
| Admin dashboard shell | ✅ | User and platform health sections |
| Keyboard and screen-reader foundations | 🔄 | Landmarks, labels, native disclosure menus, and visible focus styles are in place; manual assistive-technology review remains |
| Visual assets | ✅ | Lucide icons and a CSS-generated product report preview; no external asset dependency |
| Production build | ✅ | `npm run build` passed with the application routes and server handlers |

## Phase 2 — Authentication & Database

| Feature | Status | Notes |
|---------|--------|-------|
| Database schema | ✅ | Auth tables, learner-default role, and foreign keys defined with Drizzle |
| Database migrations | ✅ | Auth, learner submission, role seed, and assessor calibration migrations applied to Neon |
| Better Auth integration | ✅ | Neon HTTP adapter, Next route handler, and secure session policy |
| User registration | ✅ | Email/password registration; role is server-controlled and defaults to learner |
| Login | ✅ | Email/password sign-in with workspace routing |
| Session handling | ✅ | Seven-day database sessions and password-reset revocation |
| RBAC | ✅ | Learner, assessor, moderator, and admin roles enforced server-side |
| Protected routes | ✅ | Workspace pages require the matching authenticated role |
| Password recovery | ✅ | One-hour reset token, generic request response, Resend delivery, and rate limits |
| Runtime credentials | 🔄 | Local Neon and auth credentials are configured. Resend key/sender, R2 credentials, OpenAI key, and cron secret are not configured. |

## Phase 3 — Learner Submissions

| Feature | Status | Notes |
|---------|--------|-------|
| Learner profiles | ✅ | Learner-owned headline, bio, and portfolio URL stored in Neon |
| Project creation | ✅ | Owner-scoped projects with skill area and summary |
| Submission forms | ✅ | Create drafts, save project narrative, record consent and submit |
| Evidence links | ✅ | Learners can attach project, repository, and demo URLs to a draft |
| Evidence uploads | 🔄 | Private R2 presigned uploads/downloads are implemented and constrained by MIME type and file length; R2 credentials and bucket CORS still need setup |
| Submission versioning | ✅ | Submitted versions are immutable; a new draft starts the next version |
| Submission status | ✅ | Live dashboard counts and per-project draft/submitted states |

## Phase 4 — Assessment Engine

| Feature | Status | Notes |
|---------|--------|-------|
| Role catalog and competency definitions | ✅ | Admin-managed role and six entry-level frontend criteria; practitioner calibration remains a content task |
| Role-specific challenge library | ✅ | Versioned challenge drafts can be edited and published after the rubric |
| Versioned rubric management | ✅ | Admin UI edits draft criteria and anchors and publishes rubric versions |
| Assessor assignment | ✅ | Admin assigns only assessors approved for the request's exact rubric version; self-review is blocked |
| Conflict disclosure and calibration | ✅ | Assessors clear or recuse before reviewing; calibration is version-specific and approved by admin/moderator |
| Learner challenge and verification request | ✅ | Learners submit a versioned role challenge and pair it with a portfolio version; employer discovery and AI analysis are explicit opt-ins |
| Independent evidence-based assessments | ✅ | Assessor rating per competency cites portfolio or challenge evidence; drafts can be saved and submitted |
| AI-assisted analysis | 🔄 | Structured Responses API worker is implemented and gated by learner consent and an admin setting; OpenAI credentials remain missing |
| Background processing | ✅ | Authenticated worker route, Hobby-compatible daily Vercel Cron schedule, and bounded retry handling |
| Disagreement moderation | ✅ | Two-level disagreement threshold flags requests; moderator/admin makes the final decision |

## Phase 5 — Moderation & Reports

| Feature | Status | Notes |
|---------|--------|-------|
| Moderation workflow | ✅ | Decision queue includes independent ratings and advisory AI output |
| Report generation | ✅ | Learner report preserves rubric version, assessor ratings, rationale, evidence references, and date |
| Public verification | ✅ | Learner-created bearer links use random tokens stored only as SHA-256 hashes |
| Report revocation | ✅ | Learners can revoke share links; admins/moderators can revoke an approved report |

## Phase 6 — Administration

| Feature | Status | Notes |
|---------|--------|-------|
| Admin dashboard and assessment operations | ✅ | Live learner/review/report counts, assignment, moderation, and calibration review |
| User management | ✅ | User listing, role assignment, disable/enable with session revocation; changes are audited |
| Audit logs | ✅ | Recent 200 administrative, moderation, access, and report-sharing events |
| Platform settings | ✅ | New requests, employer discovery, and AI assistance default off and are admin-controlled |
| Employer profile discovery and report access | ✅ | Employer role sees only learner-opted-in profiles and opted-in approved roles; private report links are independently revocable |

## Phase 7 — Testing & Deployment

| Feature | Status | Notes |
|---------|--------|-------|
| Unit tests | ✅ | Five native Node tests cover disagreement thresholds and duplicate-review handling |
| Integration tests | ⬜ | Route/database integration harness is not configured |
| E2E tests | ⬜ | Hosted auth/storage journeys need production-like credentials and browser runner setup |
| Lint and typecheck | ✅ | `npm run lint` and `npm run typecheck` pass |
| Production build | ✅ | `npm run build` passes |
| Deployment config | 🔄 | `vercel.json` schedules the worker; Vercel project, domain, and encrypted environment variables remain to be configured |

## Known Security Advisories

| Advisory | Severity | Package | Impact | Status |
|----------|----------|---------|--------|--------|
| Next.js CVEs (<16.3.0) | Critical/High | `next` | RCE, cache poisoning, DoS | **Resolved** by upgrade to Next.js 16.4.5 |
| PostCSS source map disclosure | High | `postcss` | Arbitrary map file disclosure | **Resolved** by upgrade to PostCSS 8.5.32 |
| Zod collection exhaustion | High | `zod` | Denial of Service | **Resolved** by upgrade to Zod 4.6.7 |
| minimatch glob amplification | Moderate | `minimatch` (via eslint-config-next) | Dev-only build linting | Accepted dev-time dependency risk |
| esbuild dev server request | Moderate | `esbuild` (via drizzle-kit) | Dev CLI execution only | Accepted dev-time dependency risk |

## Technical Blockers

- The in-app browser could not reach the local preview on either `localhost:3000` or `127.0.0.1:3000`, so responsive visual review remains pending.
- Production email, Cloudflare R2, OpenAI, and cron credentials are not configured in `.env.local` or the current process environment.

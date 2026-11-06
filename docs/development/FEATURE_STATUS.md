# Feature Status

*Last updated: 2026-11-05 (Foundation Audit Completed)*

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
| Production build | ✅ | Webpack build passed after the final shell revision; all eight routes prerendered using an isolated output directory |

## Phase 2 — Authentication & Database

| Feature | Status | Notes |
|---------|--------|-------|
| Database schema | ✅ | Auth tables, learner-default role, and foreign keys defined with Drizzle |
| Database migrations | 🔄 | Initial SQL generated; awaiting configured Neon URL before applying |
| Better Auth integration | ✅ | Neon HTTP adapter, Next route handler, and secure session policy |
| User registration | ✅ | Email/password registration; role is server-controlled and defaults to learner |
| Login | ✅ | Email/password sign-in with workspace routing |
| Session handling | ✅ | Seven-day database sessions and password-reset revocation |
| RBAC | ✅ | Learner, assessor, moderator, and admin roles enforced server-side |
| Protected routes | ✅ | Workspace pages require the matching authenticated role |
| Password recovery | ✅ | One-hour reset token, generic request response, Resend delivery, and rate limits |
| Runtime credentials | 🔄 | Ignored `.env.local` now has a generated development secret and local URLs; Neon URL and Resend key/sender still need configuration |

## Phase 3 — Learner Submissions

| Feature | Status | Notes |
|---------|--------|-------|
| Learner profiles | ⬜ | |
| Project creation | ⬜ | |
| Submission forms | ⬜ | |
| Evidence uploads | ⬜ | |
| Submission versioning | ⬜ | |

## Phase 4 — Assessment Engine

| Feature | Status | Notes |
|---------|--------|-------|
| Rubric management | ⬜ | |
| Assessor assignment | ⬜ | |
| Independent assessments | ⬜ | |
| AI-assisted analysis | ⬜ | |
| Background processing | ⬜ | |

## Phase 5 — Moderation & Reports

| Feature | Status | Notes |
|---------|--------|-------|
| Moderation workflow | ⬜ | |
| Report generation | ⬜ | |
| Public verification | ⬜ | |
| Report revocation | ⬜ | |

## Phase 6 — Administration

| Feature | Status | Notes |
|---------|--------|-------|
| User management | ⬜ | |
| Audit logs | ⬜ | |
| Platform settings | ⬜ | |

## Phase 7 — Testing & Deployment

| Feature | Status | Notes |
|---------|--------|-------|
| Unit tests | ⬜ | |
| Integration tests | ⬜ | |
| E2E tests | ⬜ | |
| Deployment config | ⬜ | |

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

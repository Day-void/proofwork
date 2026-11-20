# ProofWork

ProofWork helps learners show practical skills through real projects, optional role tasks, and evidence-based human reviews. Learners control what they share. AI reviewer assistance is optional, consent-gated, and advisory; people make assessment decisions.

## Current application

The app is a Next.js 16 / React 19 / TypeScript application using Tailwind CSS, Better Auth, Neon Postgres, and Drizzle ORM. It includes learner, employer, assessor, moderator, and administrator workspaces. Some capabilities stay unavailable until an administrator enables them and the service credentials are configured.

New registrations always receive the `learner` role. A signup choice for employer or assessor submits an access request; it does not grant that role. An administrator reviews requests at `/admin/users` and can approve or decline them. Direct role changes in user management remain available to administrators.

## Start locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
Copy-Item .env.example .env.local
# Fill in Neon pooled/direct URLs and Better Auth values in .env.local.
npm run db:generate
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. For PowerShell, `Copy-Item` is the Windows equivalent of `cp`. `DATABASE_URL_UNPOOLED` is required for migrations and for multi-write assessor actions that need transactions; `DATABASE_URL` is the pooled URL for normal app traffic. Review generated SQL and confirm the environment before applying migrations, especially in production. Do not put secrets into source control.

## How to use ProofWork

### Learner workspace — `/dashboard`

1. Create a project with a summary and skill area.
2. Add a submission version describing the work, process, and outcomes. Evidence links work without extra services; file uploads require the optional R2 setup described below.
3. Save a draft while it is in progress. Submitted versions stay immutable; continue with a new version when revising.
4. Use **Assessments** to choose an active role, complete its challenge, pair the challenge with a portfolio submission, and request human review.
5. Keep the profile private by default. Employer discovery is opt-in, and each verified role must also be shared before it appears to employers.
6. Review employer invitations at `/dashboard/tasks`. Read the task and criteria, accept or decline, and only submit evidence you are allowed to share. Read employer feedback on the same page.
7. Open approved reports from the assessment/report flow. Public verification links can be revoked by the learner.

The learner menu links to Profile and New project. The dashboard has a task-invitation link and project, submission, and draft counts.

### Employer workspace — `/employer`

The employer directory shows only learners who opted into profile discovery and have at least one approved role explicitly shared for discovery. It does not expose learner email addresses, private submissions, or assessor notes. Admins control the **Employer discovery** setting in `/admin/settings` (off by default).

Use **Role tasks** or open `/employer/tasks` to invite a listed, discoverable learner to a job-related task. Provide clear instructions and criteria. The task is private to the employer and invited learner. The learner decides whether to accept and what response/evidence to provide. Employers can review submitted responses and send feedback. Invitations are blocked while employer discovery is paused.

### Assessor workspace — `/assessor`

Assessors see only reviews assigned to them and published rubrics available for calibration. Before opening evidence, disclose a conflict or recuse. Complete calibration for the exact rubric version and wait for administrator/moderator approval. When assigned a review, cite the submitted evidence for each competency and provide a rationale. Human assessors determine ratings; AI assistance never decides the result.

### Administrator workspace — `/admin`

Administrators manage accounts, review employer/assessor access requests (`/admin/users`), publish roles, challenges, and rubric versions, assign reviews, inspect moderation and audit activity, and configure platform settings (`/admin/settings`). Open the admin hamburger menu and choose **User management** to review access requests; that menu stays available on the User management page. New assessments, employer discovery, and AI assistance are off unless an administrator enables them. Grant elevated roles only after reviewing the access request and verifying that the account is appropriate for the workspace.

Moderators use `/assessor` for moderation and calibration review, subject to their assigned permissions.

## How to trigger AI reviewer assistance

AI assistance is not a chatbot and there is no general prompt box. It provides bounded evidence-gap observations and questions for a human assessor.

1. Configure `OPENAI_API_KEY` in the hosting environment and confirm a unique, private `CRON_SECRET` of at least 32 characters is already set for that deployment target. If it is missing, generate and add one; do not replace an existing secret without rotating it intentionally.
2. An administrator turns **AI reviewer assistance** on in `/admin/settings`.
3. When requesting a verification review in `/dashboard/assessment`, the learner checks the explicit AI-consent box. Without that consent, project text and ratings are not sent to OpenAI for this feature.
4. Once an assessor submits a review for that request, ProofWork queues an assistance job if both consent and the admin setting are still enabled.
5. The scheduled worker at `/api/jobs/assessment-analysis` processes up to three queued jobs per run. `vercel.json` schedules it daily at 03:00 UTC, compatible with Vercel Hobby's daily cron allowance. It can also be invoked by an authorized operator using `Authorization: Bearer <CRON_SECRET>`.
6. The result appears in the assessment/moderation workflow as advisory material. A human assessor or moderator remains responsible for every decision.

If AI assistance is missing, check the learner's consent, the admin setting, `OPENAI_API_KEY`, `CRON_SECRET`, and the Vercel cron configuration/logs. Never commit or paste a live secret into issues or chat.

## Environment services and user setup

The repository contains the integrations, but production use requires account-level setup:

- **Neon:** Set pooled `DATABASE_URL` for app traffic and direct `DATABASE_URL_UNPOOLED` for migrations. Migrations through `0012` are applied to Production; review and test any future migration before applying it to the production branch.
- **Better Auth:** Set a private `BETTER_AUTH_SECRET` (32+ characters), `BETTER_AUTH_URL`, and `NEXT_PUBLIC_APP_URL` to the deployed app URL.
- **Vercel:** ProofWork already has a live deployment at `proofwork-steel.vercel.app`. Verify its existing Production variables and daily Hobby cron before any new deployment; this local checkout is not linked to the Vercel project CLI. The core Neon/auth/URL/cron variable names were reported as already present, but their values and runtime behavior still need owner verification.
- **AI:** Set `OPENAI_API_KEY`, choose `OPENAI_MODEL` if needed, confirm `CRON_SECRET` exists for the same deployment target, and enable the feature from the admin dashboard only after reviewing consent and AI operations.
- **Cloudflare R2:** File uploads are optional. If enabled, create an R2 account, bucket, scoped access keys, and bucket CORS rules, then set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` in ignored `.env.local` or Vercel's encrypted environment settings. Keep `.env.example` limited to blank values and safe placeholders. Existing evidence-link flows work independently of R2.
- **Resend:** Password recovery delivery requires `RESEND_API_KEY` and `AUTH_EMAIL_FROM` using a verified sender/domain. If you do not own a domain yet, password recovery email cannot be verified for production; do not claim it is working until delivery is confirmed.

These actions require access to the corresponding owner/admin consoles and cannot be completed from the codebase alone. See `docs/deployment/USER_SETUP_CHECKLIST.md` for the guided handoff.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve a production build locally |
| `npm run lint` | Run ESLint on `src/` |
| `npm run typecheck` | Run TypeScript checks |
| `npm run test:unit` | Run native Node unit tests (assessment rules and employer task states) |
| `npm run test:integration` | Run Neon schema integration checks when `TEST_DATABASE_URL_UNPOOLED` points to a disposable test branch; otherwise the suite is skipped |
| `npm run test:e2e` | Run Playwright smoke checks for the public entry, workspace request fields, and signed-out route protection; guarded mutation journeys are opt-in and require the disposable Neon test branch |
| `npm run db:generate` | Generate a migration from the Drizzle schema |
| `npm run db:migrate` | Apply pending migrations to the configured database |
| `npm run db:studio` | Open Drizzle Studio |

## Key routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/register`, `/login` | Account creation and sign in |
| `/dashboard` | Learner projects and progress |
| `/dashboard/profile` | Learner profile and discovery preference |
| `/dashboard/assessment` | Role challenge and review request |
| `/dashboard/tasks` | Employer task invitations and responses |
| `/dashboard/reports/[requestId]` | Approved assessment report |
| `/employer` | Opt-in verified learner directory |
| `/employer/tasks` | Create and review employer tasks |
| `/assessor` | Assigned reviews and calibration |
| `/admin` | Operations overview |
| `/admin/users` | Account roles and access request approvals |
| `/admin/roles`, `/admin/assessments`, `/admin/settings`, `/admin/audit` | Assessment setup and operations |

## Testing and release notes

Run `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, and `npm run build` before release. Set `TEST_DATABASE_URL_UNPOOLED` only to a disposable Neon test branch when running integration checks; those checks use a transaction and roll back their sample data. Playwright's credential-free smoke tests default to the live public site; use `PLAYWRIGHT_BASE_URL` to target a local or preview deployment. The opt-in Playwright mutation journeys cover employer request signup and the complete task invite/response/feedback cycle on a dedicated local test branch. Administrator approval and role switching after a fresh sign-in remain a manual check. See `tests/e2e/README.md` for the safe setup and remaining journey checklist. Verify migrations on a non-production Neon branch first, and test role approval with a non-admin account before enabling employer discovery in production.

## Documentation

- [System architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)
- [Architecture decisions](docs/architecture/ARCHITECTURE_DECISIONS.md)
- [Feature status](docs/development/FEATURE_STATUS.md)
- [Implementation roadmap](docs/development/IMPLEMENTATION_ROADMAP.md)
- [Security model](docs/security/SECURITY_MODEL.md)
- [Permission matrix](docs/security/PERMISSION_MATRIX.md)
- [Service setup checklist](docs/deployment/USER_SETUP_CHECKLIST.md)
- [End-to-end test checklist](tests/e2e/README.md)

## License

ISC

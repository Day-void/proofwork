# ProofWork setup that needs an account owner

Use this checklist for the live account-owner handoff. Keep each secret inside the provider's environment-variable form; do not send it in chat or commit it to Git.

## 1. Test and apply the database migration

This change adds the `workspace_access_request` and `employer_task` tables, validates their statuses, and prevents duplicate pending requests for the same user/workspace. The generated SQL is in migrations `0010_little_tag.sql`, `0011_busy_green_goblin.sql`, and `0012_real_mother_askani.sql`.

1. Migrations `0010`–`0012` were applied to Production branch `br-cold-hill-beami78w` on 2026-11-19. Production's Drizzle ledger includes migration `0012`. The `proofwork-feature-test` branch is now a schema-only branch based on Production's current schema; it contains no copied Production rows.
2. Migrations `0010_little_tag.sql` through `0012_real_mother_askani.sql` create access/task tables, indexes, and constraints; they do not rewrite existing user or submission data.
3. `npm run test:integration` and the guarded Playwright employer signup and task-lifecycle journeys pass against `proofwork-feature-test`. The owner also confirmed that approving an employer request and signing in again opens the employer dashboard. Employer discovery still needs to be enabled by an administrator before invitations can be sent in Production.
4. Production preflight checks returned zero duplicate AI jobs, malformed challenge/submission evidence rows, or duplicate verification pairs. The Production migration is complete. For future migrations, verify the active branch and ledger before running `npm run db:migrate`.

The following read-only queries document the preflight checks used before the 2026-11-19 Production migration. They are included for audit/reference; they do not need to be rerun for migrations already recorded in Production:

```sql
SELECT request_id, count(*)
FROM ai_analysis_job
WHERE request_id IS NOT NULL
GROUP BY request_id
HAVING count(*) > 1;

SELECT id, kind, url, object_key, content_type, byte_size
FROM challenge_evidence
WHERE NOT (
  (kind = 'link' AND url IS NOT NULL AND object_key IS NULL)
  OR
  (kind = 'file' AND object_key IS NOT NULL AND content_type IS NOT NULL AND byte_size IS NOT NULL AND byte_size > 0)
);

SELECT id, kind, url, object_key, content_type, byte_size
FROM submission_evidence
WHERE NOT (
  (kind = 'link' AND url IS NOT NULL AND object_key IS NULL)
  OR
  (kind = 'file' AND object_key IS NOT NULL AND content_type IS NOT NULL AND byte_size IS NOT NULL AND byte_size > 0)
);

SELECT learner_id, portfolio_submission_id, challenge_submission_id, count(*)
FROM verification_request
WHERE portfolio_submission_id IS NOT NULL
  AND challenge_submission_id IS NOT NULL
GROUP BY learner_id, portfolio_submission_id, challenge_submission_id
HAVING count(*) > 1;
```

Each query returned zero rows before the Production migration. The migration tool applies every migration not yet recorded in Production, not only `0010`–`0012`.

Do not run the migration in a terminal until you have checked which Neon branch the current environment variables point to.

## 2. Approve employer and assessor workspaces

1. Create a normal account at `/register` and choose the appropriate workspace request.
2. Supply an organization and a clear reason for access. The account remains a learner until approved.
3. The disposable branch `proofwork-feature-test` has a dedicated test administrator. For the Production bootstrap, register the intended address at `https://proofwork-steel.vercel.app/register` and make sure you control that account. Public signup only grants the learner role. ProofWork currently does not require or send email verification at signup; the `email_verified` flag remains false unless a verification flow is completed.
4. In the Neon SQL Editor, select Production branch `br-cold-hill-beami78w` and run this one statement. It only promotes that exact registered email, revokes its existing sessions, and returns a row only if the account exists:

   ```sql
   WITH promoted AS (
     UPDATE "user"
     SET role = 'admin', updated_at = now()
     WHERE lower(email) = lower('maringisanwaday@gmail.com')
     RETURNING id, email, role
   ), revoked AS (
     DELETE FROM "session" AS s
     USING promoted AS p
     WHERE s.user_id = p.id
     RETURNING s.id
   )
   SELECT p.email, p.role, (SELECT count(*) FROM revoked) AS revoked_sessions
   FROM promoted AS p;
   ```

   Confirm it returns exactly one row with the intended email and `admin` role. If it returns no row, the account has not registered on Production; stop and register it first. Do not change any other account's role, and do not manually set `email_verified` to true.
5. Sign in again at the live site; the refreshed session should open the admin workspace. Open the hamburger menu and choose **User management**.
6. For employer or assessor requests, review the applicant and reason; approval changes the role and marks the request in the same database statement, then revokes existing sessions. Ask the applicant to sign in again. The Production employer approval and fresh-sign-in flow has been confirmed by the owner.

If the initial administrator account or credentials are unavailable, recover access through the existing trusted admin process. Do not send passwords or connection strings in chat.

## 3. Enable employer tasks

1. Approve an employer account through `/admin/users`.
2. Ensure at least one learner has opted into profile discovery and shared an approved verified role.
3. In `/admin/settings`, enable **Employer discovery**. This switch also pauses new task invitations while off.
4. The employer opens `/employer`, chooses **Role tasks**, selects an eligible learner, and sends a task with clear instructions and criteria.
5. The learner chooses whether to accept, can submit a written response and optional evidence link, and can read feedback at `/dashboard/tasks`.
6. The employer can review a submitted response and provide feedback at `/employer/tasks`.

Use test accounts and non-sensitive sample work first. Leave employer discovery off until moderation, support, and privacy expectations are ready.

## 4. Configure AI reviewer assistance (optional)

1. Add `OPENAI_API_KEY` as an encrypted Vercel environment variable for the intended deployment target. Confirm that target already has the matching `CRON_SECRET` (Vercel previously reported that variable name as existing); generate and set one only if it is missing. Keep secrets out of chat and source control.
2. Confirm `vercel.json` deploys the daily `/api/jobs/assessment-analysis` cron. Use Vercel Logs to confirm the worker runs successfully.
3. In `/admin/settings`, enable **AI reviewer assistance**.
4. Request an assessment as a learner and explicitly select the AI-consent checkbox.
5. Submit an assessor review. The worker queues advisory analysis for that request; the human assessor remains responsible for decisions.
6. Verify the resulting assistance in the moderation/review UI. If a call fails, inspect the AI job error and hosting logs without exposing keys.

## 5. Configure uploads (optional)

If accepting file uploads, create a Cloudflare R2 bucket, create scoped credentials, configure the bucket's CORS rules for the deployed app origin, and set all four variables in ignored `.env.local` or Vercel's encrypted environment settings: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`. Keep `.env.example` limited to blank values and safe placeholders; never put real credentials there. Test upload and authorized download with a small non-sensitive file. Existing external evidence links do not require R2.

## 6. Configure recovery email (optional until you own a sender domain)

Resend did not respond from the user's network during prior setup, and no owned sender domain is available yet. Do not assume delivery works. When a domain is available, verify it in Resend, add `RESEND_API_KEY` and `AUTH_EMAIL_FROM` to Vercel, request password recovery from a test account, and confirm delivery and the reset flow.

## 7. Deployment status and remaining owner checks

1. The latest release commit is pushed and deployed to `proofwork-steel.vercel.app`; the Vercel deployment completed, production smoke checks passed, and the owner confirmed that admin sign-in opens the admin dashboard.
2. The Production migrations are applied, and `maringisanwaday@gmail.com` is an active admin. Its email is currently unverified because ProofWork does not yet enforce or send email verification at signup.
3. Confirm the Production environment variables and daily cron behavior in Vercel.
4. Complete the remaining owner checks in `tests/e2e/README.md`: confirm Production environment variables and cron behavior, then enable employer discovery only when an opted-in learner with an approved discoverable role is available. The employer invitation/learner response/employer feedback lifecycle is covered by the guarded E2E test on the schema-only branch; assessor review and admin controls still need an appropriate dedicated test account for a manual walkthrough.

Employer discovery and AI remain off until an administrator enables them. R2 and Resend are optional integrations; R2 requires accepting usage-based billing and Resend delivery requires a verified sender domain.

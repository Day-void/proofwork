# ProofWork setup that needs an account owner

Use this checklist when the code review is complete. Keep each secret inside the provider's environment-variable form; do not send it in chat or commit it to Git.

## 1. Test and apply the database migration

This change adds the `workspace_access_request` and `employer_task` tables, validates their statuses, and prevents duplicate pending requests for the same user/workspace. The generated SQL is in migrations `0010_little_tag.sql`, `0011_busy_green_goblin.sql`, and `0012_real_mother_askani.sql`.

1. The migration has been applied to Neon branch `proofwork-feature-test`, a child of Production. The local `.neon` pointer and `.env.local` now target this test branch.
2. Migrations `0010_little_tag.sql` through `0012_real_mother_askani.sql` create access/task tables, indexes, and constraints; they do not rewrite existing user or submission data.
3. `npm run test:integration` passes against the test branch. Complete the manual signup, access approval, and employer-task journeys with dedicated test accounts before release.
4. Apply these migrations to Production only after code review, manual testing, and an explicit production change decision. Use the direct/unpooled URL and confirm the active branch before running `npm run db:migrate`.

Before migrating Production, run these read-only checks in the Production Neon SQL Editor. They catch the existing-data conditions that could make migrations `0007` or `0008` reject the unique indexes or evidence checks:

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

Each query should return zero rows. If any return rows, stop and review those records before migrating. The migration tool applies every migration not yet recorded in Production, not only `0010`–`0012`.

Do not run the migration in a terminal until you have checked which Neon branch the current environment variables point to.

## 2. Approve employer and assessor workspaces

1. Create a normal account at `/register` and choose the appropriate workspace request.
2. Supply an organization and a clear reason for access. The account remains a learner until approved.
3. The disposable branch `proofwork-feature-test` now has a dedicated test administrator. Sign in with that account and open `/admin/users`; its previous signup session was revoked so the admin role loads on a fresh sign-in. Production administrator access must use the existing trusted admin process.
4. Review the applicant and reason; approve or decline. Approval changes the role and marks the request in the same database statement, then revokes existing sessions.
5. Ask the applicant to sign in again. Their workspace navigation is based on their current server-side role.

If the initial administrator account or credentials are unavailable, recover access through the existing trusted admin process. Do not create an admin through public signup.

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

## 7. Deploy after review

1. Run the documented lint, typecheck, unit, and build commands locally.
2. Complete the manual journeys in `tests/e2e/README.md` against the test Neon branch.
3. Commit and push only after reviewing the final diff.
4. In Vercel, confirm the Production environment variables and cron, then deploy the intended commit.
5. Smoke-test signup, learner projects, role approval, employer invitations, assessor review, and admin controls on the deployment.

The user must decide when to apply a migration to Production, enable employer discovery or AI, configure paid/usage-based services, and deploy. Those operations need owner-console access and explicit timing.

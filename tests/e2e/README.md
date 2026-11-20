# End-to-end journey checklist

The default Playwright smoke suite covers the public landing/registration entry and signed-out route guards. It performs only page reads and form-control changes; it does not submit accounts or mutate Production data. Run it with `npm run test:e2e`. Playwright uses installed Google Chrome stable by default; if Chrome is unavailable, install Playwright Chromium with `npx playwright install chromium` and set `PLAYWRIGHT_BROWSER_CHANNEL=chromium`. The default target is the live public deployment; set `PLAYWRIGHT_BASE_URL` to a local or preview deployment to change the target.

Opt-in mutation tests submit an employer access request and exercise the employer task invitation, learner response, and feedback lifecycle. They are disabled unless `PLAYWRIGHT_TEST_MUTATIONS=1`, require `PLAYWRIGHT_BASE_URL` to be a local origin, and check that `TEST_DATABASE_URL_UNPOOLED` targets the dedicated `proofwork-feature-test` Neon branch before creating anything. That branch is schema-only and contains no copied Production rows. The tests use unique `.invalid` emails and synthetic records, then clean them up. Do not weaken these guards or point the test database variable at Production. For the local app, set `DATABASE_URL` and `DATABASE_URL_UNPOOLED` to the direct URL for this test branch, then start the app with `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` set to the same local origin. Run a mutation test with the flag and test-branch URL set in the same shell. For example, in PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://localhost:3000"
$env:PLAYWRIGHT_TEST_MUTATIONS = "1"
$env:TEST_DATABASE_URL_UNPOOLED = "<direct URL for the proofwork-feature-test Neon branch>"
npm run test:e2e -- --grep "employer signup creates"
```

Run the task lifecycle separately with `npm run test:e2e -- --grep "employer task invite"`. Unset the mutation flag after the run. Signup request creation and employer task lifecycle are automated; administrator approval and role switching after a fresh sign-in remain separate checks.

The broader role and task journeys below remain manual and must run on a non-production deployment connected to a disposable Neon branch and dedicated test accounts. Do not test with real learner documents or personal information.

After applying the branch migrations, you can run the database contract check with `TEST_DATABASE_URL_UNPOOLED` set to that disposable branch and `npm run test:integration`. It creates synthetic rows inside a transaction and rolls them back. Never point this variable at Production.

## Accounts and prerequisites

- One administrator, one learner, one employer applicant, and one assessor applicant.
- The disposable test branch already has a dedicated administrator account provisioned by the project owner. Use that account for admin journeys. If its access is unavailable, recover it through the owner's trusted process; do not promote an applicant or use public signup to self-assign a role. Never make test-account role changes on Production.
- Keep signup and admin review on the same deployment and Neon branch. Neon test branches are isolated from Production, so a request created against one branch will not appear in the other branch's admin queue. The success notice means the request action returned successfully; the account intentionally remains a learner until approval, then the applicant must sign in again after the old session is revoked. If the notice appears but the admin queue is empty, compare the active deployment's `DATABASE_URL` branch for signup and admin before retrying.
- If the local app starts on a port other than 3000, set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to that same local origin before restarting it; Better Auth rejects sign-in requests from untrusted origins.
- One discoverable learner with an approved role, plus one learner who has not opted in (to verify privacy filtering).
- Employer discovery and new assessments enabled only in the test environment.
- At least one published role, challenge, and rubric; a calibrated test assessor.
- For uploads, a test R2 bucket. For AI, an OpenAI key, `CRON_SECRET`, and the AI admin setting. Tests can omit optional providers.

## Journeys

| Journey | Steps | Expected result |
| --- | --- | --- |
| Public signup stays learner | Register using learner choice; inspect admin user list | Account role is learner; no elevated role fields are accepted from the browser |
| Employer access request | Register as employer with organization and reason; review at `/admin/users`; approve | Request appears pending; account remains learner before approval; approval changes role; next sign-in opens employer workspace |
| Assessor access request | Repeat for assessor; approve and sign in | Assessor workspace is available; no assessor role is granted before approval |
| Access request decline | Create request and decline from admin | Request is no longer pending; applicant keeps learner role |
| Learner privacy defaults | Create profile with discovery off; visit employer directory as employer | Profile is absent; no personal email, private submissions, or assessor notes are returned |
| Employer task invite | Enable discovery; invite opted-in eligible learner from `/employer/tasks` | Invitation appears for that learner only; invitation to an ineligible ID is rejected by the server |
| Task form feedback | Submit an invalid response, then a valid action on each task form | Validation/server errors appear inline; duplicate or stale actions are rejected; successful actions show pending/confirmation feedback or the updated task state |
| Learner declines | Decline an invitation | Task moves to declined and cannot be submitted |
| Learner completes task | Accept invitation, submit response and optional HTTPS evidence link | Task moves through accepted to submitted; another learner cannot read or mutate it |
| Employer feedback | Review submitted task and send feedback | Only its inviting employer can review; learner sees feedback on `/dashboard/tasks` |
| Task state/ownership boundaries | Try changing another learner's task ID, employer ID, or a task in the wrong state | Conditional server-side updates reject the operation; no unauthorized row changes |
| Core assessment flow | Create project/submission, complete role challenge, request review, disclose conflict, assess against rubric, moderate, publish report | Only assigned users can act; report cites evidence and can be shared/revoked by its owner |
| AI consent | Submit an assessment without AI consent, then with consent in a separate test | Non-consenting work is never sent; consenting work is queued only while AI is enabled; output remains advisory |
| Disabled account | Disable a test user and attempt to use an existing session | User is redirected to sign in; old sessions are revoked |
| Responsive and keyboard access | Check at 375 px, tablet, desktop; navigate forms, disclosures, menus, and dialogs with keyboard/screen reader | No clipped forms; visible focus, sensible labels, and operable controls |

## Record the run

For each journey, record deployment commit, Neon branch, test-account IDs (not passwords), date, pass/fail, and any error/request ID. Remove test data after the run according to the test branch policy. Never store API keys, session tokens, or real learner evidence in results.

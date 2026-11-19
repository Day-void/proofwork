# End-to-end journey checklist

There is no browser automation runner installed in this repository yet. Use this checklist on a non-production deployment connected to a disposable Neon branch and dedicated test accounts. Do not test with real learner documents or personal information.

After applying the branch migrations, you can run the database contract check with `TEST_DATABASE_URL_UNPOOLED` set to that disposable branch and `npm run test:integration`. It creates synthetic rows inside a transaction and rolls them back. Never point this variable at Production.

## Accounts and prerequisites

- One administrator, one learner, one employer applicant, and one assessor applicant.
- The disposable test branch already has a dedicated administrator account provisioned by the project owner. Use that account for admin journeys. If its access is unavailable, recover it through the owner's trusted process; do not promote an applicant or use public signup to self-assign a role. Never make test-account role changes on Production.
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

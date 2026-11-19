# Production environment setup

Set these values in the hosting provider's encrypted environment settings. Do not commit real credentials.

## Neon and authentication

- `DATABASE_URL`: Neon pooled connection string for application requests.
- `DATABASE_URL_UNPOOLED`: Neon direct connection string for migrations.
- Assessment workflows that must update related records together (conflict disclosure, assessor review save/submit and moderation checks, final decisions and audit events, appeals, report-share creation/revocation, and learner discoverability changes) require this direct URL because Neon HTTP does not support interactive transactions. The app rejects those writes with a configuration error if the direct connection is unavailable; it does not fall back to a non-transactional adapter.
- `BETTER_AUTH_SECRET`: unique random value of at least 32 characters.
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`: the canonical HTTPS app origin.
- Apply migrations with `npm run db:migrate` before deploying the matching application version.
- Public registration always creates a learner. After the first trusted account registers, promote the initial administrator once from the Neon SQL editor with `UPDATE "user" SET role = 'admin' WHERE email = '<trusted-admin-email>';` and verify the affected row before proceeding. Do not expose a public admin bootstrap route.

## Password reset email

- `RESEND_API_KEY`: Resend API key.
- `AUTH_EMAIL_FROM`: sender address on a domain verified with Resend. Configure SPF, DKIM, and DMARC for that domain.

## Cloudflare R2 evidence files

- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`.
- Create a private bucket. Keep public bucket access disabled; the app uses short lived signed upload and download URLs.
- Configure the bucket's CORS policy to allow the exact app origin and local development origin, `PUT` and `GET`, and the `Content-Type` request header. Expose only headers the app needs (none are currently read by the UI).
- The app accepts PDF, PNG, JPEG, WebP, and text files up to 10 MB. Upload signatures bind the exact MIME type and content length. The signed upload URL expires after five minutes; download URLs expire after two minutes.
- Use a dedicated R2 token scoped to this bucket, and rotate it if it is exposed.

## AI reviewer assistance

- `OPENAI_API_KEY`: optional. `OPENAI_MODEL` defaults to `gpt-4.1-mini` and can be set to an enabled Responses API model that supports Structured Outputs.
- `CRON_SECRET`: unique random value of at least 32 characters. Configure the same value in the Vercel environment so the scheduled assessment-analysis route can authenticate.
- The database setting `ai_analysis_enabled` is off until an admin enables it. Learners separately opt in per verification request. The worker sends project narratives and human ratings, omits names and URLs, and stores advisory structured output. It never decides an outcome.
- `vercel.json` schedules the worker once daily at 03:00 UTC, which is compatible with Vercel Hobby. Pro can use a more frequent schedule if needed; the route can also be invoked by a trusted scheduler using `Authorization: Bearer <CRON_SECRET>`.

## Feature switches

New assessment requests, employer discovery, and AI assistance are off until an administrator enables them in **Admin → Platform settings**. Employers see only profiles and verified roles that the learner has opted into.

## Remaining launch work

The app is live at `proofwork-steel.vercel.app`; commit `73e23a0` deployed successfully, and migrations through `0012` are applied to Production. An owner still needs to verify the Production variables and daily cron behavior in Vercel; the core Neon/auth/app URL/cron variable names were reported as already present. Add an OpenAI key only if enabling AI, configure R2 only if accepting uploads, and verify Resend delivery only after a sender domain is available. Review and test future migrations before applying them to Production. Keyboard and screen reader review also requires a human using assistive technology.

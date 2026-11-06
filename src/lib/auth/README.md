# Auth Library

Better Auth is configured in `index.ts` with the Neon Drizzle adapter. Registration assigns the learner role on the server; `guards.ts` protects learner, assessor/moderator, and admin workspaces. No admin account is seeded or created by sign-up.

Password recovery uses Better Auth's one-hour reset token and revokes sessions when a password changes. The reset email is sent through Resend after the auth response. Configure `RESEND_API_KEY` and `AUTH_EMAIL_FROM` before enabling the recovery form; the sender must be verified with Resend.

# Security Model

*Last updated: 2026-11-06*

## Authentication

- **Provider:** Better Auth 1.7.16
- **Session management:** Secure, server-side sessions
- **Password hashing:** Handled by Better Auth's built-in password provider
- **Password recovery:** Single-use, one-hour reset tokens sent through Resend; all sessions are revoked after a successful reset
- **Registration roles:** New accounts always start as `learner`; the role field is not accepted from client input
- **Workspace access:** Protected server pages check the current session and role before rendering
- **Admin provisioning:** No administrator account is created by the public registration flow

## Authorization

- **Model:** Role-Based Access Control (RBAC)
- **Roles:** Learner, Assessor, Administrator
- **Enforcement:** Server-side policy checks on every request
- **Principle:** Never trust client-submitted role information

## Data Protection

- Environment variables never exposed to the client
- Signed, expiring URLs for private file access (R2)
- Input validation on all endpoints (Zod)
- IDOR protection via resource-level permission checks

## API Security

- Rate limiting on sign-in and password-recovery endpoints
- CSRF protection via framework defaults
- XSS protection via React's built-in escaping
- Secure error responses (no stack traces in production)

## Assessment Integrity

- Immutable submission versions
- Independent assessor evaluations (no cross-contamination)
- Append-only audit trails
- Report revocation capability

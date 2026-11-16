# Security Model

*Last updated: 2026-11-16*

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
- **Roles:** Learner, Assessor, Moderator, Administrator, Employer
- **Enforcement:** Server-side policy checks on every request
- **Principle:** Never trust client-submitted role information

## Data Protection

- Environment variables never exposed to the client
- Private R2 uploads are signed for the learner's own prefix; signed download URLs are issued only to the owner, an assigned conflict-cleared assessor, or an administrator/moderator.
- R2 upload signatures bind file type and content length, expire quickly, and accept only an allowlisted MIME type and maximum 10 MB.
- Report links use random bearer tokens; only SHA-256 hashes are stored. Learners can revoke links; moderators/admins can revoke a report.
- Employer discovery requires platform enablement plus learner-level and report-level opt-in. Email, submission content, and assessor notes are excluded from the directory.
- AI analysis is disabled by default and requires separate learner consent per request. Project text is sent without account names or URLs; output is advisory and cannot decide outcomes.
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
- Append-only audit trails for role/access changes, report decisions, calibration, and sharing changes
- Report revocation capability

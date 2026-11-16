# Permission Matrix

*Last updated: 2026-11-16*

| Action | Learner | Assessor | Moderator | Admin | Employer |
|--------|---------|----------|-----------|-------|----------|
| Register a new account | ✅ (learner role only) | — | — | — | — |
| View/edit own profile | ✅ | — | — | — | — |
| Opt into employer discovery | ✅ | — | — | — | — |
| Create project, submission, or challenge | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read own submitted work and requests | ✅ | ❌ | ❌ | ✅ | ❌ |
| Create a verification request | ✅ (when enabled) | ❌ | ❌ | ❌ | ❌ |
| View assigned submission evidence | ❌ | ✅ (after conflict clearance) | ✅ (assigned moderation work) | ✅ | ❌ |
| Submit assessor ratings | ❌ | ✅ (assigned, cleared review) | ❌ | ❌ | ❌ |
| Complete assessor calibration | ❌ | ✅ | ✅ | — | ❌ |
| Approve calibration | ❌ | ❌ | ✅ | ✅ | ❌ |
| Assign assessors | ❌ | ❌ | ❌ | ✅ | ❌ |
| Make final report decision | ❌ | ❌ | ✅ | ✅ | ❌ |
| Appeal an outcome | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create/revoke own report links | ✅ | ❌ | ❌ | ❌ | ❌ |
| Revoke an approved report | ❌ | ❌ | ✅ | ✅ | ❌ |
| Manage users and platform switches | ❌ | ❌ | ❌ | ✅ | ❌ |
| View audit history | ❌ | ❌ | ❌ | ✅ | ❌ |
| Browse opted-in verified profiles | ❌ | ❌ | ❌ | ✅ | ✅ |
| View a shared public verification | Anyone holding a live learner-created link | Anyone holding a live learner-created link | ✅ | ✅ | ✅ |

All mutation actions re-check authorization server-side. Disabled accounts have their sessions revoked and cannot use guarded workspaces or signed file-download endpoints.

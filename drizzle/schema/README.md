# Database Schema

The initial authentication schema lives in `src/lib/database/schema.ts`. It contains Better Auth's user, session, account, and verification tables. New users receive the `learner` role by default; role changes must come from trusted server-side administration.

Generate migrations with `npm run db:generate` and apply them to the configured Neon database with `npm run db:migrate`.

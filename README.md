# ProofWork

A professional skills verification and assessment platform.

ProofWork bridges the gap between having practical skills and being able to demonstrate them. Learners submit real web development projects, which receive AI-assisted analysis and independent human assessments, producing verified, shareable skill reports.

## Status

**Phase 2 — Authentication & Database** (in progress)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui, Lucide React
- **Backend:** Next.js Route Handlers, Zod validation
- **Database:** PostgreSQL (Neon), Drizzle ORM
- **Auth:** Better Auth (RBAC)
- **AI:** OpenAI (structured outputs, assistant role only)
- **Storage:** Cloudflare R2 (signed URLs)
- **Testing:** Vitest, Playwright

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm 9+

### Setup

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add Neon and Resend credentials to .env.local, then generate and apply the schema
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

Password recovery requires a Resend API key and a sender address from a verified domain. New accounts receive the `learner` role. No administrator account is created by registration.

### Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check the application |
| `npm run db:generate` | Generate SQL migrations from the Drizzle schema |
| `npm run db:migrate` | Apply pending migrations using `DATABASE_URL_UNPOOLED` (falls back to `DATABASE_URL`) |
| `npm run db:studio` | Open Drizzle Studio for the configured database |

## Project Structure

```
src/
  app/           # Next.js pages and layouts
  components/    # UI components
  features/      # Domain feature modules
  lib/           # Shared libraries
  server/        # Server-side logic
  types/         # TypeScript types
  hooks/         # React hooks
  config/        # Configuration

drizzle/         # Database schema and migrations
workers/         # Background workers
tests/           # Test suites
docs/            # Documentation
```

## Documentation

- [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)
- [Architecture Decisions](docs/architecture/ARCHITECTURE_DECISIONS.md)
- [Feature Status](docs/development/FEATURE_STATUS.md)
- [Implementation Roadmap](docs/development/IMPLEMENTATION_ROADMAP.md)
- [Security Model](docs/security/SECURITY_MODEL.md)
- [Permission Matrix](docs/security/PERMISSION_MATRIX.md)

## Licence

ISC

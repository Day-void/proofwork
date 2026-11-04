# ProofWork

A professional skills verification and assessment platform.

ProofWork bridges the gap between having practical skills and being able to demonstrate them. Learners submit real web development projects, which receive AI-assisted analysis and independent human assessments, producing verified, shareable skill reports.

## Status

**Phase 0 — Foundation** (in progress)

## Tech Stack

- **Frontend:** Next.js 15.1 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3.4, shadcn/ui, Lucide React
- **Backend:** Next.js Route Handlers, Zod validation
- **Database:** PostgreSQL (Neon), Drizzle ORM
- **Auth:** Better Auth (RBAC)
- **AI:** OpenAI (structured outputs, assistant role only)
- **Storage:** Cloudflare R2 (signed URLs)
- **Testing:** Vitest, Playwright

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm 9+

### Setup

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

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

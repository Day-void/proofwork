# ProofWork — System Architecture

## Overview

ProofWork is a skills verification and assessment platform built as a **modular monolith** using Next.js (App Router).

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|--------|
| Frontend | Next.js (App Router) + React | 16.4.5 / 19.0.0 |
| Language | TypeScript | 5.7.3 |
| Styling | Tailwind CSS + shadcn/ui | 4.3.4 |
| Icons | Lucide React | 1.67.0 |
| Backend | Next.js Route Handlers | 16.4.5 |
| Database | PostgreSQL (Neon HTTP) | — |
| ORM | Drizzle ORM | 0.45.4 |
| Authentication | Better Auth | 1.7.16 |
| Validation | Zod | 4.6.7 |
| AI | OpenAI API (adapter pattern) | — |
| File Storage | Cloudflare R2 (S3-compatible) | — |
| Background Jobs | PostgreSQL-backed job queue | — |

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                  Client                      │
│  Next.js App Router (React Server Components)│
├─────────────────────────────────────────────┤
│               API Layer                      │
│        Next.js Route Handlers                │
├─────────────────────────────────────────────┤
│            Service Layer                     │
│    Business Logic / Domain Services          │
├──────────┬──────────┬──────────┬────────────┤
│ Database │ Storage  │   AI     │   Queue    │
│ (Neon)   │ (R2)     │ (OpenAI) │ (PG Jobs)  │
└──────────┴──────────┴──────────┴────────────┘
```

## Project Structure

```
src/
  app/          # Next.js App Router pages and layouts
  components/   # UI components (ui, shared, layout, forms, dashboard)
  features/     # Domain feature modules
  lib/          # Shared libraries (auth, database, storage, ai, queue)
  server/       # Server-side services, repositories, policies, jobs
  types/        # Shared TypeScript types
  hooks/        # Custom React hooks
  config/       # Application configuration (env validation)

drizzle/        # Database schema and migrations
workers/        # Background job workers
tests/          # Unit, integration, e2e tests
docs/           # Documentation
public/         # Static assets
```

## Key Design Decisions

1. **Modular Monolith**: Single deployable unit with clear domain boundaries.
2. **App Router**: Server components by default, client components only when needed.
3. **Drizzle ORM**: Type-safe database access with migration support.
4. **Better Auth**: Framework-agnostic auth with RBAC support.
5. **AI as Assistant**: AI provides preliminary analysis; humans make final decisions.
6. **Immutable Records**: Assessment history is append-only; no destructive updates.

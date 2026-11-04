# Architecture Decision Records

## ADR-001: Next.js 15 with App Router

**Status:** Accepted

**Context:** Need a full-stack React framework with server-side rendering, API routes, and modern React features.

**Decision:** Use Next.js 15.1.0 with the App Router (not Pages Router).

**Rationale:** App Router provides React Server Components, streaming, and a clearer separation between server and client code.

---

## ADR-002: Tailwind CSS v3 (not v4)

**Status:** Accepted

**Context:** Tailwind v4 is available but represents a significant API change. shadcn/ui component tooling is still optimised for v3.

**Decision:** Use Tailwind CSS 3.4.17.

**Rationale:** Mature ecosystem, broad tooling support, stable configuration API. Will evaluate migration to v4 when shadcn/ui fully supports it.

---

## ADR-003: React 19

**Status:** Accepted

**Context:** Next.js 15 supports both React 18 and 19.

**Decision:** Use React 19.0.0.

**Rationale:** Next.js 15 is designed for React 19. React 19 provides improved Server Components, form handling, and hooks.

---

## ADR-004: Better Auth for Authentication

**Status:** Accepted

**Context:** Need a flexible, framework-agnostic authentication solution with RBAC.

**Decision:** Use Better Auth 1.7.16.

**Rationale:** TypeScript-first, supports multiple auth strategies, built-in RBAC, session management, and works well with Next.js.

---

## ADR-005: Drizzle ORM with Neon PostgreSQL

**Status:** Accepted

**Context:** Need type-safe database access with migration support for a serverless PostgreSQL provider.

**Decision:** Use Drizzle ORM 0.45.4 with @neondatabase/serverless 1.2.0.

**Rationale:** Drizzle provides excellent TypeScript inference, SQL-like query builder, and first-class Neon support. Lightweight compared to Prisma.

---

## ADR-006: Removed deprecated shadcn-ui package

**Status:** Accepted

**Context:** The `shadcn-ui` npm package (0.4.0) is deprecated. The modern approach uses `npx shadcn@latest` CLI.

**Decision:** Remove `shadcn-ui` from dependencies. Use `shadcn` CLI to add individual components. Install utility dependencies (`class-variance-authority`, `clsx`, `tailwind-merge`) directly.

**Rationale:** shadcn/ui is not installed as a package — it's a CLI that copies component source files into the project. The utility libraries it depends on are installed separately.

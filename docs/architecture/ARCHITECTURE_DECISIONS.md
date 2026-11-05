# Architecture Decision Records

## ADR-001: Next.js 15 with App Router (SUPERSEDED by ADR-008)

**Status:** Superseded by ADR-008

**Context:** Need a full-stack React framework with server-side rendering, API routes, and modern React features.

**Decision:** Use Next.js 15.1.0 with the App Router.

---

## ADR-002: Tailwind CSS v3 (SUPERSEDED by ADR-007)

**Status:** Superseded by ADR-007

**Context:** Initial scaffold evaluated Tailwind v4 ecosystem maturity.

**Decision:** Temporarily used Tailwind CSS 3.4.17 during early Phase 0 scaffold.

---

## ADR-003: React 19

**Status:** Accepted

**Context:** Next.js 16 requires React 19 as the primary peer dependency.

**Decision:** Use React 19.0.0 and React DOM 19.0.0.

**Rationale:** React 19 provides first-class support for Server Components, Actions, improved hooks, and high-performance concurrent rendering.

---

## ADR-004: Better Auth for Authentication

**Status:** Accepted

**Context:** Need a flexible, framework-agnostic authentication solution with RBAC.

**Decision:** Use Better Auth 1.7.16.

**Rationale:** TypeScript-first, supports multiple auth strategies, built-in RBAC, session management, and verified compatibility with Next.js 16 and Drizzle ORM 0.45.4.

---

## ADR-005: Drizzle ORM with Neon PostgreSQL

**Status:** Accepted

**Context:** Need type-safe database access with migration support for serverless PostgreSQL.

**Decision:** Use Drizzle ORM 0.45.4 with @neondatabase/serverless 1.2.0 and Drizzle Kit 0.31.11.

**Rationale:** Drizzle provides compile-time TypeScript inference, lightweight footprint, and zero cold-start overhead compared to Prisma.

---

## ADR-006: Removed deprecated shadcn-ui package

**Status:** Accepted

**Context:** The `shadcn-ui` npm package (0.4.0) is deprecated. The modern approach uses `npx shadcn` CLI.

**Decision:** Remove `shadcn-ui` from dependencies. Install individual Radix primitives (`@radix-ui/react-slot`, `@radix-ui/react-label`, `@radix-ui/react-separator`) and styling utilities directly.

---

## ADR-007: Migration to Tailwind CSS v4

**Status:** Accepted

**Context:** The architecture specification requires Tailwind CSS v4. The earlier scaffold had temporarily pinned v3.4.17.

**Decision:**
1. Upgrade to `tailwindcss@4.3.4` with `@tailwindcss/postcss@4.3.4`.
2. Remove obsolete `tailwind.config.ts`.
3. Adopt CSS-first configuration via `@import "tailwindcss"` and `@theme inline` in `src/app/globals.css`.
4. Migrate all design tokens (deep navy palette, teal accent palette, warm surface neutrals, border radii, shadows) directly into CSS custom properties.
5. Configure `@source` directives for automated scanning of components and feature directories.

**Rationale:** Tailwind v4 brings instant compilation via Lightning CSS, cleaner single-file configuration, and native CSS variable integration matching shadcn/ui requirements.

---

## ADR-008: Next.js 16.4.5 Upgrade & Security Remediation

**Status:** Accepted

**Context:** Security audit of Next.js 15.1.0 identified 35 CVEs (critical and high severity) including remote code execution (RCE), denial of service (DoS), cache poisoning, and authentication bypass risks.

**Decision:** Upgrade Next.js to stable `16.4.5` and `@types/node` to `22.13.10`.

**Rationale:** Next.js 16.4.5 fully resolves all reported Next.js security advisories, introduces native Turbopack improvements, and provides full compatibility with React 19 and Better Auth 1.7.16.

---

## ADR-009: Zod 4.6.7 Upgrade

**Status:** Accepted

**Context:** Zod versions prior to 4.6.6 contained a high-severity vulnerability (memory exhaustion / DoS when processing oversized collections).

**Decision:** Upgrade to `zod@4.6.7`.

**Rationale:** Fully secures environment and payload validation while maintaining clean integration with `src/config/env.ts` using `z.url()`, `z.enum()`, and `z.prettifyError()`.

---

## ADR-010: ESLint 9 Flat Config Migration

**Status:** Accepted

**Context:** Next.js 16 and ESLint 9.x deprecate the legacy `.eslintrc.json` format and the `next lint` CLI wrapper in favor of standard ESLint flat configuration.

**Decision:**
1. Create `eslint.config.mjs` importing `eslint-config-next`, `eslint-config-next/core-web-vitals`, and `eslint-config-next/typescript`.
2. Delete legacy `.eslintrc.json`.
3. Update `package.json` lint script to `eslint src/`.
4. Upgrade `eslint` to `^9.39.5` and `postcss` to `^8.5.32` to resolve high-severity vulnerability GHSA-qx2v-qp2m-jg93.

---

## ADR-011: shadcn/ui Initialization & Component Architecture

**Status:** Accepted

**Context:** shadcn/ui must be properly initialized with standard tooling and verified components rather than partial dependencies.

**Decision:**
1. Create standard `components.json` targeting Tailwind v4 and CSS variables.
2. Implement initial core components adhering to official shadcn/ui specifications:
   - `Button`: CVA variant engine (default, destructive, outline, secondary, ghost, link) with slot delegation.
   - `Card`: Semantic container system (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
   - `Input`: Accessible input with focus-visible ring semantics.
   - `Label`: Accessible label primitive backed by `@radix-ui/react-label`.
   - `Badge`: Status and category chips with multi-variant support.
   - `Separator`: Accessible divider backed by `@radix-ui/react-separator`.
3. Validate component rendering in Next.js Server Components.

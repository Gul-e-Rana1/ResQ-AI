# ResQ AI Phase 1 Architecture

## Scope

Phase 1 establishes the production foundation without replacing the exported Figma UI. The existing React screens remain the frontend foundation and are mounted through the Next.js App Router.

## Application Layers

- `app/`: Next.js App Router pages, layout, API routes, and Vercel runtime entry points.
- `src/App.tsx`: exported Figma application shell, preserved as a client component.
- `src/components/` and `src/pages/`: existing Figma-exported UI screens and reusable UI elements.
- `src/lib/`: platform services, environment validation, Supabase clients, constants, and utilities.
- `src/providers/`: client providers such as TanStack Query.
- `src/types/`: shared domain contracts.
- `supabase/migrations/`: database schema, RLS, and Pakistan reference seed data.
- `scripts/`: local setup scripts for Supabase migrations.

## Supabase

Supabase is the source of truth for authentication, PostgreSQL data, storage, and realtime features. The schema uses Supabase Auth user IDs as profile IDs and keeps application roles in `public.profiles`.

## Security Foundation

- Environment variables are validated with Zod.
- Public and server-only environment access are separated.
- Supabase SSR clients are split into browser, request-scoped server, and service-role admin factories.
- Row Level Security is enabled on application tables.
- A middleware refreshes Supabase sessions for server-rendered and route-handler flows.

## Pakistan-Only Scope

Initial constants, emergency departments, and seeded relief camps are Pakistan-specific. The model keeps province and district as plain text fields so international normalization can be added later without blocking the current Pakistan-only release.

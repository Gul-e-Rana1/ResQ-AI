# Supabase Setup

## Environment

The app expects these Supabase variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

`DATABASE_URL` must point to the Supabase PostgreSQL database. Use the pooled or direct connection string from Supabase project settings.

## Apply Migrations

Run:

```bash
npm run db:migrate
```

The migration runner:

- reads `.env.local`
- creates `public.schema_migrations`
- applies SQL files from `supabase/migrations` in filename order
- skips migrations that were already applied

## Current Migrations

- `202607240001_initial_schema.sql`: application enums, tables, indexes, triggers, profile creation hook, and RLS policies.
- `202607240002_seed_pakistan_reference_data.sql`: Pakistan emergency departments, approved relief camps, and baseline supplies.

## Demo Accounts

Demo account creation is intentionally deferred to Phase 2 because Supabase Auth users must be created through the Auth Admin API so passwords are hashed by Supabase Auth. The database trigger in Phase 1 is ready to create matching `profiles` rows when those users are inserted.

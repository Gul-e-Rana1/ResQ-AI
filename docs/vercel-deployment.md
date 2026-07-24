# Vercel Deployment Notes

Deployment is Phase 10, but the Phase 1 foundation is Vercel-ready:

- `next.config.ts` uses Next.js 15 App Router.
- `npm run build` runs `next build`.
- Runtime API routes live under `src/app/api`.
- Server secrets are read only from server-side code.

## Required Vercel Environment Variables

Set these in the Vercel project before deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `NEXT_PUBLIC_MAP_PROVIDER`
- `NEXT_PUBLIC_MAPTILER_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

Optional automation variables:

- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `GITHUB_TOKEN`

## Health Check

After deployment, `/api/health` reports whether required service environment variables are present without exposing secret values.

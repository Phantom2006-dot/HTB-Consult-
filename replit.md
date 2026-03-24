# HTB Consult Academy

A professional training and mentoring platform for HighTicketBoss (HTB Consults), built with React + Vite on the frontend and a lightweight Express backend.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite, served on port 5000 in development
- **Backend**: Express server on port 3001 in development (proxied via Vite), handles AI chat API
- **Auth & Database**: Supabase (auth, PostgreSQL, realtime)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: TanStack React Query

## Key Files

- `src/` — React frontend (pages, components, hooks, contexts)
- `server/index.ts` — Express backend (AI chat endpoint, static file serving in production)
- `src/integrations/supabase/` — Supabase client and generated types
- `src/contexts/AuthContext.tsx` — Auth state using Supabase auth
- `src/hooks/` — React Query hooks for courses, mentors, bookings, enrollments, bookmarks, etc.

## Development

```bash
npm run dev
```

Starts both the Vite dev server (port 5000) and the Express API server (port 3001) concurrently.

## Production Build

```bash
npm run build   # builds frontend to dist/public, compiles server to dist/server
npm run start   # runs Express server on port 5000, serves static files + /api routes
```

## Environment Variables / Secrets

- `VITE_SUPABASE_URL` — Supabase project URL (in .env)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key (in .env)
- `OPENAI_API_KEY` — OpenAI API key for AI chat assistant (Replit Secret, server-side only)

## Features

- Course catalogue with enrolment and progress tracking
- Mentor profiles, availability, and booking system
- AI chat assistant (HTB Consults advisor, powered by GPT-4o-mini)
- Admin dashboard for managing courses, mentors, users, and enrollments
- User profiles, notifications, saved courses, and messaging
- Supabase row-level security for all data

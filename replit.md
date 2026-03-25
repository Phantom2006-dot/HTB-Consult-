# HTB Consult Academy

A professional training and mentoring platform for HTB Consults, built with React + Vite frontend and Express/Node.js backend. Fully running on Replit with JWT auth and Replit PostgreSQL.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000 in dev)
- **Backend**: Express/Node.js on port 3001 (`/server` directory)
- **Auth**: JWT (`htb_token` in localStorage). `AuthContext` wraps all pages.
- **Database**: Replit PostgreSQL via `DATABASE_URL` env var. Schema in `schema.sql`.
- **AI Chat**: OpenAI via `OPENAI_API_KEY` secret
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack React Query v5

## Admin Credentials

- **Email**: `phantom@htbconsult.com`
- **Password**: `Phantom2006++`
- **Role**: admin

## Key Files

| File | Purpose |
|---|---|
| `schema.sql` | Full PostgreSQL schema + seed data (already applied to Replit DB) |
| `server/index.ts` | Express entry point, CORS, routes |
| `server/routes/auth.ts` | Login / register / me endpoints |
| `server/routes/admin.ts` | Admin CRUD (users, courses, mentors, enrollments) |
| `server/middleware/auth.ts` | JWT `requireAuth` / `requireAdmin` middleware |
| `server/db.ts` | PostgreSQL connection pool |
| `src/lib/api.ts` | JWT-aware frontend API client |
| `src/contexts/AuthContext.tsx` | JWT auth context (token, user state) |

## Frontend Pages

- `/` — Landing page
- `/auth` — Login / register
- `/dashboard` — Student dashboard
- `/courses` — Course explorer
- `/course/:id` — Course detail
- `/mentors` — Mentor listing
- `/mentor/:id` — Mentor profile
- `/profile` — User profile
- `/messages`, `/emails`, `/chat` — Communication pages
- `/admin/*` — Admin section (Users, Courses, Mentors, Enrollments, Categories)
- `/mentor-dashboard` — Mentor-specific dashboard

## Environment Variables

All set as Replit secrets/env vars:
- `DATABASE_URL` — Replit PostgreSQL connection string (auto-managed)
- `JWT_SECRET` — Secret key for signing JWT tokens
- `SERVER_PORT` — `3001`
- `NODE_ENV` — `development`
- `OPENAI_API_KEY` — OpenAI key for AI chat (add to enable chat feature)

## Development

The `Start application` workflow runs `npm run dev` which concurrently starts:
- Vite dev server on port 5000 (frontend, with proxy to API)
- Express on port 3001 (backend)

## API Proxy

Vite proxies all `/api/*` requests to the Express server on port 3001 during development.

# HTB Consult Academy

A professional training and mentoring platform for HTB Consults, built with React + Vite frontend and Express/Node.js backend. Fully migrated from Supabase/Lovable to a self-hosted JWT + Neon DB stack.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000 in dev)
- **Backend**: Express/Node.js on port 3001 (`/backend` directory)
- **Auth**: JWT (`htb_token` in localStorage). `AuthContext` wraps all pages.
- **Database**: Neon DB (PostgreSQL) via `DATABASE_URL` env var. Schema in `schema.sql`.
- **Images**: Cloudinary (unsigned upload). Env vars: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- **AI Chat**: OpenAI via `OPENAI_API_KEY`
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack React Query v5

## Admin Credentials

- **Email**: `phantom@htbconsult.com`
- **Password**: `Phantom2006++`
- **Role**: admin

## Key Files

| File | Purpose |
|---|---|
| `schema.sql` | Full Neon DB schema + seed data (run in Neon SQL Editor) |
| `backend/src/index.ts` | Express entry point, CORS, routes |
| `backend/src/routes/auth.ts` | Login / register / me endpoints |
| `backend/src/routes/admin.ts` | Admin CRUD (users, courses, mentors, enrollments) |
| `backend/src/middleware/auth.ts` | JWT `requireAuth` / `requireAdmin` middleware |
| `src/lib/api.ts` | JWT-aware frontend API client |
| `src/lib/cloudinary.ts` | Cloudinary unsigned upload helper |
| `src/components/CloudinaryUpload.tsx` | Reusable image upload component (file picker + URL paste) |
| `src/contexts/AuthContext.tsx` | JWT auth context (token, user state) |
| `backend/fly.toml` | Fly.io deployment config |
| `vercel.json` | Vercel deployment config |
| `DEPLOY.md` | Full deployment guide (Neon, Fly.io, Vercel, Cloudinary) |

## Frontend Pages

- `/` — Landing page
- `/login`, `/register` — Auth pages
- `/dashboard` — Student dashboard
- `/courses` — Course explorer
- `/courses/:slug` — Course detail
- `/mentors` — Mentor listing
- `/mentors/:id` — Mentor profile
- `/profile` — User profile (with Cloudinary avatar upload)
- `/messages`, `/emails`, `/chat` — Communication pages
- `/admin/*` — Admin section (Users, Courses, Mentors, Enrollments, Categories, Settings)
- `/mentor-dashboard` — Mentor-specific dashboard

## Environment Variables

### Backend (set as Fly.io secrets for production)
- `DATABASE_URL` — Neon DB connection string
- `JWT_SECRET` — Secret key (min 32 chars)
- `OPENAI_API_KEY` — OpenAI key for AI chat
- `PORT` — `3001`
- `NODE_ENV` — `production`

### Frontend (set as Vercel env vars for production)
- `VITE_API_URL` — Backend URL (e.g. `https://htb-consult-api.fly.dev`)
- `VITE_CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` — Unsigned upload preset name

## Deployment

See `DEPLOY.md` for a complete step-by-step guide:
1. Run `schema.sql` in Neon DB SQL Editor
2. Deploy backend to Fly.io (`cd backend && fly deploy`)
3. Deploy frontend to Vercel (connect GitHub repo)

## Development

The `Start application` workflow runs `npm run dev` which starts:
- Vite dev server on port 5000 (frontend)
- Express on port 3001 (backend, proxied via Vite)

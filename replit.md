# HTB Consult Academy

A full-stack learning management platform for HighTicketBoss (HTB Consults), offering courses, mentoring bookings, an AI chat assistant, and an admin dashboard.

## Architecture

- **Frontend**: React 18 + Vite + TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Node.js + Express (TypeScript), running on port 3001
- **Database**: Replit PostgreSQL (connected via `pg` pool using `DATABASE_URL`)
- **Auth**: Custom JWT-based auth (bcryptjs passwords, jsonwebtoken tokens)
- **AI Chat**: OpenAI GPT-4o-mini via server-side Express route (`/api/chat`)
- **Image uploads**: Cloudinary (cloud name: `di2u0n1qj`)

## Development

The `dev` script runs both the Vite frontend (port 5000) and Express backend (port 3001) concurrently. Vite proxies `/api/*` requests to the backend.

```
npm run dev
```

## Environment Variables

Set in Replit Secrets:
- `DATABASE_URL` — Replit PostgreSQL connection string (auto-set)
- `JWT_SECRET` — Token signing secret
- `OPENAI_API_KEY` — Required for the AI chat assistant
- `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — Image uploads

Set in Replit env vars (shared):
- `VITE_CLOUDINARY_CLOUD_NAME=di2u0n1qj`
- `VITE_CLOUDINARY_UPLOAD_PRESET=htb_academy`
- `SERVER_PORT=3001`
- `JWT_SECRET=htb-consults-jwt-secret-2025-replit`

## Database Schema

16 tables in Replit PostgreSQL (created via executeSql, not migrations):
`users`, `user_roles`, `categories`, `courses`, `modules`, `lessons`, `enrollments`, `lesson_progress`, `mentors`, `availability_slots`, `bookings`, `bookmarks`, `certificates`, `chat_conversations`, `chat_messages`, `emails`

pgcrypto extension is enabled for `gen_random_bytes()` in certificate verification codes.

## Key Routes

### Backend API (`server/routes/`)
- `/api/auth` — register, login, me, profile update
- `/api/courses` — public + admin CRUD
- `/api/mentors` — mentor profiles + admin CRUD
- `/api/enrollments` — user course enrollments
- `/api/bookings` — mentor session bookings
- `/api/bookmarks` — saved courses
- `/api/categories` — course categories
- `/api/admin` — stats, user management, enrollments
- `/api/chat` — AI chat (streaming) + conversation history
- `/api/emails` — internal messaging

### Frontend Pages (`src/pages/`)
- `/` — Homepage
- `/courses` — Course catalogue
- `/mentors` — Mentor listing
- `/auth` — Login / Register
- `/dashboard` — Student dashboard
- `/chat` — AI assistant
- `/admin` — Admin dashboard (admin role required)

## Notes

- Supabase has been fully replaced with Replit PostgreSQL. The `src/integrations/supabase/client.ts` is a no-op stub.
- The `supabase/` directory contains historical migrations for reference only — not used at runtime.
- The `backend/` directory is a legacy duplicate — the active server is `server/`.
